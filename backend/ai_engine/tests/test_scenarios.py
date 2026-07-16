import pytest
from ..schemas import AIRequest
from ..decision_engine import DecisionEngine

def test_scenario_leaf_blight():
    # Scenario 1: Leaf Blight + High humidity -> Expect Treat Disease
    request = AIRequest(
        farmer_id="1",
        weather={"forecast": [{"condition": "Rain", "humidity": 85}]},
        disease_history=[{"disease_name": "Leaf Blight", "status": "active"}]
    )
    candidates = DecisionEngine.generate_candidates(request)
    assert any(c.title == "Treat Leaf Blight" for c in candidates)
    assert any(c.trigger == "disease" for c in candidates)

def test_scenario_heavy_rain():
    # Scenario 2: Heavy rain -> Expect Delay Irrigation
    request = AIRequest(
        farmer_id="1",
        weather={"forecast": [{"condition": "Heavy Rain", "chance": 90}]}
    )
    candidates = DecisionEngine.generate_candidates(request)
    assert any(c.title == "Delay Irrigation" for c in candidates)

def test_scenario_market_spike():
    # Scenario 3: Market price spike -> Expect Sell Today
    request = AIRequest(
        farmer_id="1",
        market={"commodity": "Wheat", "trends": [{"commodity": "Wheat", "trend": 6.5, "modal_price": 2500}]}
    )
    candidates = DecisionEngine.generate_candidates(request)
    assert any(c.title == "Sell Wheat Today" for c in candidates)
    
def test_scenario_no_weather():
    # Scenario 4: No weather data -> Graceful degraded recommendation
    request = AIRequest(farmer_id="1") # Empty context
    candidates = DecisionEngine.generate_candidates(request)
    assert len(candidates) == 0 # Or whatever your deterministic engine defaults to
