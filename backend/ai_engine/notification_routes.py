from fastapi import APIRouter, HTTPException
import json
import time
from .schemas import NotificationRequest, NotificationResponse
from .logger import get_logger
from .rag_service import RAGService
from .groq_service import GroqService
from .notification_prompt_builder import NotificationPromptBuilder
from .notification_validators import NotificationValidator
from .cache_service import CacheService

router = APIRouter()
rag_service = RAGService()
groq_service = GroqService()
cache_service = CacheService()
logger = get_logger("notification_engine")

@router.post("/notifications/generate", response_model=NotificationResponse)
async def generate_notifications(request: NotificationRequest):
    start_time = time.time()
    
    if not request.candidates:
        return NotificationResponse(
            requestId=request.requestId,
            notifications=[],
            status="success"
        )

    # 1. Check cache (hash of candidates & profile)
    cache_key = f"notif_{request.farmer_id}_{hash(str(request.candidates))}"
    cached = cache_service.get(cache_key)
    if cached:
        logger.info(f"[{request.requestId}] Notification Cache hit")
        return NotificationResponse(**cached)

    try:
        # 2. RAG Retrieval for context (optional, based on candidate titles)
        documents = RAGService.retrieve_knowledge(context={}, candidates=request.candidates, top_k=2)

        # 3. Build Prompt
        prompt = NotificationPromptBuilder.build_prompt(request, documents)

        # 4. LLM Generation
        llm_response_text = await groq_service.generate_json(prompt)
        llm_json = json.loads(llm_response_text)

        # 5. Validation
        validated_response = NotificationValidator.validate_response(llm_json, request)

        # 6. Cache and return
        cache_service.set(cache_key, validated_response.model_dump())
        
        exec_time = int((time.time() - start_time) * 1000)
        logger.info(f"[{request.requestId}] Notifications generated in {exec_time}ms")
        
        return validated_response

    except Exception as e:
        exec_time = int((time.time() - start_time) * 1000)
        logger.error(f"[{request.requestId}] Notification Generation failed: {str(e)} ({exec_time}ms)")
        raise HTTPException(status_code=500, detail="AI Engine Error")
