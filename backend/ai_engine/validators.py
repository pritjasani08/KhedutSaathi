from typing import Dict, Any, List
import re
from .schemas import AIResponse, Decision

class ResponseValidator:
    @staticmethod
    def validate(response_dict: Dict[str, Any], original_candidates: List[Any] = None, request: Any = None) -> AIResponse:
        """
        Validates the parsed JSON against strict business rules and schema.
        Raises ValueError if any constraints are violated.
        """
        # 1. Pydantic schema validation
        response = AIResponse(**response_dict)
        
        all_decisions: List[Decision] = []
        if response.topDecision:
            all_decisions.append(response.topDecision)
        all_decisions.extend(response.decisions)
        
        seen_ids = set()
        seen_titles = set()
        valid_types = {"MARKET", "WEATHER", "DISEASE", "YIELD", "SCHEME", "GENERAL"}
        
        # Determine valid sources from request context
        valid_sources_lower = {"farmer profile", "icar knowledge"} # Defaults
        if request:
            req_dict = request.model_dump()
            for key, val in req_dict.items():
                if val and isinstance(val, (dict, list)): # If block has data, allow its name as a source
                    valid_sources_lower.add(key.lower().replace("_", " "))
                    valid_sources_lower.add(key.lower())
            
        filler_phrases = [
            "based on available data", "the model predicts", "the ai suggests", 
            "it appears", "likely", "may help", "potentially"
        ]

        candidate_map = {c.id: c for c in original_candidates} if original_candidates else {}

        for decision in all_decisions:
            # 2. Immutable checks against original candidates
            if decision.id in candidate_map:
                orig = candidate_map[decision.id]
                if decision.confidence != orig.confidence:
                    raise ValueError(f"Immutable field changed: confidence for {decision.id}")
                if decision.priorityScore != orig.priorityScore:
                    raise ValueError(f"Immutable field changed: priorityScore for {decision.id}")
                if decision.type != orig.type:
                    raise ValueError(f"Immutable field changed: type for {decision.id}")
                if decision.trigger != orig.trigger:
                    raise ValueError(f"Immutable field changed: trigger for {decision.id}")
                if decision.expiresAt != orig.expiresAt:
                    raise ValueError(f"Immutable field changed: expiresAt for {decision.id}")
            
            # 3. Confidence and PriorityScore ranges
            if not (0 <= decision.confidence <= 100):
                raise ValueError(f"Decision '{decision.id}' has invalid confidence: {decision.confidence}. Must be 0-100.")
            if not (0.0 <= decision.priorityScore <= 1.0):
                raise ValueError(f"Decision '{decision.id}' has invalid priorityScore: {decision.priorityScore}. Must be 0.0-1.0.")
                
            # 4. Valid decision types
            if decision.type not in valid_types:
                raise ValueError(f"Decision '{decision.id}' has invalid type: '{decision.type}'. Must be one of {valid_types}.")
                
            # 5. Duplicates check
            if decision.id in seen_ids:
                raise ValueError(f"Duplicate decision ID found: {decision.id}")
            if decision.title in seen_titles:
                raise ValueError(f"Duplicate decision title found: '{decision.title}'")
            
            seen_ids.add(decision.id)
            seen_titles.add(decision.title)
            
            # 6. Non-empty explanation arrays & impact
            if not decision.reason or len(decision.reason) == 0:
                raise ValueError(f"Decision '{decision.id}' must have at least one reason.")
            
            if not decision.expectedImpact or len(decision.expectedImpact.strip()) == 0:
                raise ValueError(f"Decision '{decision.id}' must have an expectedImpact.")
                
            if not decision.followUp or len(decision.followUp) == 0:
                raise ValueError(f"Decision '{decision.id}' must have at least one followUp action.")
            
            # 7. Generic Filler Check
            all_text = " ".join(decision.reason).lower() + " " + decision.expectedImpact.lower()
            for filler in filler_phrases:
                if filler in all_text:
                    raise ValueError(f"Decision '{decision.id}' contains generic filler phrase: '{filler}'")

            # 8. Source Validation
            if request:
                for src in decision.sources:
                    src_name_lower = src.name.lower()
                    if not any(v in src_name_lower or src_name_lower in v for v in valid_sources_lower):
                        raise ValueError(f"Decision '{decision.id}' contains hallucinated source: '{src.name}'. Valid context keys: {valid_sources_lower}")

            # 9. Personalization Factor Validation
            if request and decision.personalization_factors:
                memory_obj = request.memory or {}
                recent_decisions = request.recent_decisions or []
                
                if not memory_obj and not recent_decisions:
                    raise ValueError(f"Decision '{decision.id}' contains personalization factors but no memory was provided in context.")
                
                # We enforce that if they use personalization factors, they are at least string types and not excessively long
                for factor in decision.personalization_factors:
                    if len(factor) > 200:
                        raise ValueError(f"Personalization factor too long: '{factor}'.")
                    if "model" in factor.lower() or "ai" in factor.lower():
                        raise ValueError(f"Personalization factor contains AI references: '{factor}'.")
                        
        return response
