from fastapi import APIRouter, HTTPException
from schemas import TimelineRequest, TimelineResponse
from timeline_prompt_builder import build_timeline_prompt
from timeline_validators import validate_timeline_response
from groq_service import GroqService
from logger import get_logger
import json

logger = get_logger("TimelineRoutes")
router = APIRouter()
groq_service = GroqService()

@router.post("/timeline/generate", response_model=TimelineResponse)
async def generate_timeline_explanation(request: TimelineRequest):
    try:
        prompt = build_timeline_prompt(
            profile=request.profile,
            memory=request.memory,
            recent_decisions=request.recent_decisions,
            candidates=[c.model_dump() for c in request.candidates]
        )
        
        raw_response = await groq_service.generate_json(prompt)
        
        try:
            parsed_json = json.loads(raw_response)
        except json.JSONDecodeError:
            logger.error("Failed to parse timeline JSON from Groq")
            raise HTTPException(status_code=500, detail="Invalid JSON from LLM")
            
        parsed_json["requestId"] = request.requestId
        response_obj = TimelineResponse(**parsed_json)
        
        # Validate against hallucinations
        validated_response = validate_timeline_response(request, response_obj)
        
        return validated_response
        
    except Exception as e:
        logger.error(f"Error in timeline generation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
