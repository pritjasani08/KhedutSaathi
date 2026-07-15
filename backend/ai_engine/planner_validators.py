from typing import Dict, Any
from .schemas import PlannerResponse, PlannerRequest

class PlannerResponseValidator:
    @staticmethod
    def validate(response_dict: Dict[str, Any], request: PlannerRequest) -> PlannerResponse:
        """
        Validates the parsed JSON against strict business rules and schema.
        Raises ValueError if any constraints are violated.
        """
        # 1. Pydantic schema validation
        response = PlannerResponse(**response_dict)
        
        filler_phrases = [
            "based on available data", "the model predicts", "the ai suggests", 
            "it appears", "likely", "may help", "potentially"
        ]

        # 2. Immutable checks against original ML results
        if response.bestCrop != request.mlResults.bestCrop:
            raise ValueError(f"Immutable field changed: bestCrop (expected {request.mlResults.bestCrop}, got {response.bestCrop})")
        
        if request.mlResults.expectedYield is not None:
            if response.expectedYield != request.mlResults.expectedYield:
                 raise ValueError(f"Immutable field changed: expectedYield (expected {request.mlResults.expectedYield}, got {response.expectedYield})")
                 
        if response.riskLevel != request.mlResults.riskLevel:
             raise ValueError(f"Immutable field changed: riskLevel (expected {request.mlResults.riskLevel}, got {response.riskLevel})")
        
        # 3. Alternatives validation
        for alt in response.alternatives:
            if alt not in request.mlResults.recommendedCrops:
                raise ValueError(f"Hallucinated alternative crop: {alt}")
                
        # 4. Generic Filler Check
        all_text = response.explanation.lower()
        for filler in filler_phrases:
            if filler in all_text:
                raise ValueError(f"Response contains generic filler phrase: '{filler}'")
                
        # 5. Determine valid sources from request context
        valid_sources_lower = {"crop recommendation model", "yield prediction model"}
        if request.weather:
             valid_sources_lower.add("weather")
        if request.market:
             valid_sources_lower.add("market")
             
        for src in response.sources:
             src_name_lower = src.name.lower()
             if not any(v in src_name_lower or src_name_lower in v for v in valid_sources_lower):
                 raise ValueError(f"Response contains hallucinated source: '{src.name}'. Valid context keys: {valid_sources_lower}")

        # 6. Personalization Factor Validation
        if response.personalization_factors:
            memory_obj = request.memory or {}
            recent_decisions = request.recent_decisions or []
            
            if not memory_obj and not recent_decisions:
                raise ValueError("Response contains personalization factors but no memory was provided in context.")
            
            for factor in response.personalization_factors:
                if len(factor) > 200:
                    raise ValueError(f"Personalization factor too long: '{factor}'.")
                if "model" in factor.lower() or "ai" in factor.lower():
                    raise ValueError(f"Personalization factor contains AI references: '{factor}'.")

        return response
