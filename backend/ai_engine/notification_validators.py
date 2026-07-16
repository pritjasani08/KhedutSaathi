from typing import List, Dict, Any
from schemas import NotificationResponse, NotificationRequest
from logger import get_logger

logger = get_logger("notification_validators")

class NotificationValidator:
    @staticmethod
    def validate_response(response: Dict[str, Any], request: NotificationRequest) -> NotificationResponse:
        """
        Ensures Groq did not hallucinate extra notifications or mutate deterministic fields.
        """
        try:
            parsed = NotificationResponse(**response)
            
            # Create a lookup for candidate constraints
            candidates_map = {c.id: c for c in request.candidates}
            
            validated_notifications = []
            
            for notif in parsed.notifications:
                if notif.id not in candidates_map:
                    logger.warning(f"Hallucinated notification ID {notif.id}. Dropping.")
                    continue
                
                candidate = candidates_map[notif.id]
                
                # Enforce immutability of deterministic fields
                notif.priority = candidate.priority
                notif.type = candidate.type
                notif.title = candidate.title
                notif.expiresAt = candidate.expiresAt
                notif.rawFacts = candidate.rawFacts
                
                # Validate Personalization Factors
                if notif.personalization_factors:
                    memory_obj = request.memory or {}
                    recent_decisions = request.recent_decisions or []
                    
                    if not memory_obj and not recent_decisions:
                        raise ValueError(f"Notification '{notif.id}' contains personalization factors but no memory was provided.")
                    
                    for factor in notif.personalization_factors:
                        if len(factor) > 200:
                            raise ValueError(f"Personalization factor too long: '{factor}'.")
                        if "model" in factor.lower() or "ai" in factor.lower():
                            raise ValueError(f"Personalization factor contains AI references: '{factor}'.")
                            
                validated_notifications.append(notif)
            
            parsed.notifications = validated_notifications
            return parsed
            
        except Exception as e:
            logger.error(f"Notification Validation failed: {str(e)}")
            raise ValueError(f"Invalid LLM output format: {str(e)}")
