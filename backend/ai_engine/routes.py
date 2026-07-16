from fastapi import APIRouter, HTTPException, Depends, Request, Response
from typing import Dict, Any
import time
import uuid

from schemas import AIRequest, AIResponse, PlannerRequest, PlannerResponse
from decision_engine import DecisionEngine
from rag_service import RAGService
from prompt_builder import PromptBuilder
from planner_prompt_builder import PlannerPromptBuilder
from groq_service import GroqService
from validators import ResponseValidator
from planner_validators import PlannerResponseValidator
from cache_service import cache_service
from logger import get_logger
from exceptions import ValidationError, GroqError

logger = get_logger(__name__)
router = APIRouter()
groq_service = GroqService()

@router.post("/planner-synthesis", response_model=PlannerResponse)
async def generate_planner_synthesis(request: PlannerRequest, response: Response, http_request: Request):
    start_time = time.time()
    
    # 1. RAG Retrieval
    context_dict = request.model_dump()
    documents = RAGService.retrieve_knowledge(context_dict, candidates=[])
    
    # 2. Prompt Construction
    prompt = PlannerPromptBuilder.build_prompt(request, documents)
    
    # 3. Groq Inference
    try:
        raw_json_dict = await groq_service.generate_explanation(prompt)
        
        # 4. Validation
        final_response = PlannerResponseValidator.validate(raw_json_dict, request=request)
        
        # Ensure fallback doesn't override the request
        final_response.status = "success"
        final_response.requestId = request.requestId
        
        processing_time = int((time.time() - start_time) * 1000)
        logger.info("Planner Synthesis Generated", extra={"metadata": {"processingTime": processing_time}})
        
        response.headers["X-Request-ID"] = request.requestId
        response.headers["X-Response-Time"] = f"{processing_time}ms"
        return final_response
    except Exception as e:
        processing_time = int((time.time() - start_time) * 1000)
        logger.error(f"Planner Synthesis failed: {e}", extra={"metadata": {"processingTime": processing_time}})
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    # Simple check on components
    groq_status = "healthy" if groq_service.client else "unhealthy"
    
    # Attempt to fetch rag status safely
    rag_status = "healthy" # We'll just assume healthy if imported
    try:
        from rag_system.src.retriever import Retriever
    except ImportError:
        rag_status = "unhealthy (not configured)"

    cache_stats = cache_service.get_stats()

    return {
        "status": "ok",
        "version": "1.0.0",
        "python": "healthy",
        "groq": groq_status,
        "groq_model": groq_service.model,
        "rag": rag_status,
        "cache": "healthy",
        "cache_stats": cache_stats
    }

@router.get("/version")
async def version():
    return {"version": "1.0.0"}

@router.post("/generate", response_model=AIResponse)
async def generate_briefing(request: AIRequest, response: Response, http_request: Request):
    start_time = time.time()
    
    # 1. Extract or generate Request ID
    request_id = request.requestId or http_request.headers.get("X-Request-ID") or str(uuid.uuid4())
    
    logger_meta = {
        "requestId": request_id,
        "farmerId": request.farmer_id
    }

    try:
        # 2. Check cache
        cached_response = cache_service.get(request.farmer_id)
        if cached_response:
            processing_time = int((time.time() - start_time) * 1000)
            logger.info("Cache hit", extra={"metadata": {**logger_meta, "cacheHit": True, "processingTime": processing_time}})
            response.headers["X-Request-ID"] = request_id
            response.headers["X-Response-Time"] = f"{processing_time}ms"
            return AIResponse(**cached_response)

        metrics = {}

        # 3. Deterministic Generation
        t0 = time.time()
        candidates = DecisionEngine.generate_candidates(request)
        metrics["decision_engine_ms"] = int((time.time() - t0) * 1000)

        if not candidates:
            processing_time = int((time.time() - start_time) * 1000)
            logger.info("No candidates generated", extra={"metadata": {**logger_meta, "decisionCount": 0, "processingTime": processing_time}})
            empty_response = {
                "status": "success",
                "requestId": request_id,
                "generatedAt": request.dataFreshness.get("market", "Live"),
                "dataFreshness": request.dataFreshness,
                "summary": "No critical actions required today. Your farm looks healthy.",
                "topDecision": None,
                "decisions": []
            }
            return AIResponse(**empty_response)

        # 4. RAG Retrieval
        t0 = time.time()
        context_dict = request.model_dump()
        documents = RAGService.retrieve_knowledge(context_dict, candidates)
        metrics["rag_retrieval_ms"] = int((time.time() - t0) * 1000)

        # 5. Prompt Construction
        prompt = PromptBuilder.build_prompt(request, candidates, documents)

        # 6. Groq Inference
        t0 = time.time()
        raw_json_dict = await groq_service.generate_explanation(prompt)
        metrics["groq_inference_ms"] = int((time.time() - t0) * 1000)

        # 7. Validation
        t0 = time.time()
        
        final_response = ResponseValidator.validate(raw_json_dict, original_candidates=candidates, request=request)
        metrics["validation_ms"] = int((time.time() - t0) * 1000)
        
        final_response.status = "success"
        final_response.generatedAt = request.dataFreshness.get("market", "Live")
        final_response.dataFreshness = request.dataFreshness
        final_response.requestId = request_id
        
        if request.debugMode:
            final_response.metrics = metrics
            
        processing_time = int((time.time() - start_time) * 1000)
        
        # Structured log for the decision
        log_event = {
            **logger_meta,
            "processingTime": processing_time,
            "decisionCount": len(final_response.decisions) + (1 if final_response.topDecision else 0),
            "usedRAG": True,
            "usedGroq": True,
            "cacheHit": False,
            "fallbackReason": None
        }
        if final_response.topDecision:
            log_event["topDecision"] = final_response.topDecision.title
            log_event["confidence"] = final_response.topDecision.confidence
            log_event["priority"] = final_response.topDecision.priority
            
        logger.info("AI Decision Generated", extra={"metadata": log_event})

        # Cache & Headers
        cache_service.set(request.farmer_id, final_response.model_dump())
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Response-Time"] = f"{processing_time}ms"
        return final_response
        
    except Exception as e:
        processing_time = int((time.time() - start_time) * 1000)
        
        fallback_reason = "INTERNAL_ERROR"
        if isinstance(e, ValidationError):
            fallback_reason = "VALIDATION_FAILED"
        elif isinstance(e, GroqError):
            fallback_reason = "GROQ_TIMEOUT"
            
        logger.error(f"AI Generation failed: {e}", extra={"metadata": {
            **logger_meta,
            "processingTime": processing_time,
            "fallbackReason": fallback_reason,
            "errorType": type(e).__name__
        }})
        
        fallback = {
            "status": "error",
            "requestId": request_id,
            "generatedAt": "Unknown",
            "dataFreshness": {},
            "summary": "AI generation failed. Fallback to deterministic rules.",
            "error": str(e)
        }
        
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Response-Time"] = f"{processing_time}ms"
        return AIResponse(**fallback)
