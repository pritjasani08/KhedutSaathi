import uuid
from typing import List
from schemas import AIRequest, CandidateDecision
from utils import get_current_utc_time

class DecisionEngine:
    """
    Deterministic engine that analyzes a FarmContext (AIRequest) 
    and generates CandidateDecisions before involving the LLM.
    """
    
    @staticmethod
    def generate_candidates(request: AIRequest) -> List[CandidateDecision]:
        candidates: List[CandidateDecision] = []
        now = get_current_utc_time()
        
        # 1. Weather Rule
        weather = request.weather
        if weather and "forecast" in weather:
            rain_chance = weather["forecast"][0].get("chance", 0)
            if rain_chance > 70:
                candidates.append(CandidateDecision(
                    id=f"dec-{uuid.uuid4().hex[:8]}",
                    type="WEATHER",
                    title="Delay Irrigation",
                    trigger="weather",
                    priorityScore=0.9,
                    confidence=95,
                    expiresAt="2026-07-13T00:00:00Z", # Mock expiration
                    rawFacts={"forecast": weather["forecast"]}
                ))

        # 2. Market Rule
        market = request.market
        if market and "trends" in market:
            for trend in market["trends"]:
                if trend.get("trend", 0) < -3:
                    candidates.append(CandidateDecision(
                        id=f"dec-{uuid.uuid4().hex[:8]}",
                        type="MARKET",
                        title=f"Hold {trend.get('commodity', 'Crop')} Sales",
                        trigger="market",
                        priorityScore=0.85,
                        confidence=90,
                        expiresAt="2026-07-14T00:00:00Z",
                        rawFacts={"market_trend": trend}
                    ))
                elif trend.get("trend", 0) > 4:
                    candidates.append(CandidateDecision(
                        id=f"dec-{uuid.uuid4().hex[:8]}",
                        type="MARKET",
                        title=f"Sell {trend.get('commodity', 'Crop')} Today",
                        trigger="market",
                        priorityScore=0.95,
                        confidence=92,
                        expiresAt="2026-07-12T00:00:00Z",
                        rawFacts={"market_trend": trend}
                    ))

        # 3. Disease Rule
        diseases = request.disease_history
        if diseases:
            latest_disease = diseases[-1]
            if latest_disease.get("status") == "active":
                candidates.append(CandidateDecision(
                    id=f"dec-{uuid.uuid4().hex[:8]}",
                    type="DISEASE",
                    title=f"Treat {latest_disease.get('disease_name', 'Disease')}",
                    trigger="disease",
                    priorityScore=1.0, # Highest priority
                    confidence=98,
                    expiresAt="2026-07-12T00:00:00Z",
                    rawFacts={"disease": latest_disease}
                ))

        # Sort by priority
        candidates.sort(key=lambda x: x.priorityScore, reverse=True)
        return candidates
