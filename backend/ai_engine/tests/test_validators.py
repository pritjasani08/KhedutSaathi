import pytest
from ..validators import ResponseValidator
from ..schemas import CandidateDecision, AIRequest

def test_valid_response():
    raw_dict = {
        "status": "success",
        "summary": "Valid response",
        "topDecision": {
            "id": "dec-1",
            "priority": "HIGH",
            "priorityScore": 0.95,
            "type": "MARKET",
            "trigger": "market",
            "title": "Sell Crop",
            "confidence": 92,
            "expiresAt": "2026-07-12T00:00:00Z",
            "rawFacts": {},
            "reason": ["The mandi prices are high."],
            "expectedImpact": "Increase profit by 10%.",
            "followUp": ["Sell immediately."],
            "sources": [{"name": "Market", "type": "Live", "freshness": "Live"}]
        },
        "decisions": []
    }
    
    orig_candidate = CandidateDecision(
        id="dec-1", type="MARKET", title="Sell Crop", trigger="market", 
        priorityScore=0.95, confidence=92, expiresAt="2026-07-12T00:00:00Z", rawFacts={}
    )
    request = AIRequest(farmer_id="1", market={"some": "data"})
    
    response = ResponseValidator.validate(raw_dict, original_candidates=[orig_candidate], request=request)
    assert response.status == "success"
    assert response.topDecision.id == "dec-1"

def test_immutable_field_changed():
    raw_dict = {
        "status": "success",
        "summary": "Valid response",
        "topDecision": {
            "id": "dec-1",
            "priority": "HIGH",
            "priorityScore": 0.95,
            "type": "MARKET",
            "trigger": "market",
            "title": "Sell Crop",
            "confidence": 99, # Changed from 92
            "expiresAt": "2026-07-12T00:00:00Z",
            "rawFacts": {},
            "reason": ["Reason 1"],
            "expectedImpact": "Impact",
            "followUp": ["Action"],
            "sources": []
        }
    }
    orig_candidate = CandidateDecision(
        id="dec-1", type="MARKET", title="Sell Crop", trigger="market", 
        priorityScore=0.95, confidence=92, expiresAt="2026-07-12T00:00:00Z", rawFacts={}
    )
    with pytest.raises(ValueError, match="Immutable field changed: confidence"):
        ResponseValidator.validate(raw_dict, original_candidates=[orig_candidate])

def test_filler_phrase_rejected():
    raw_dict = {
        "summary": "Valid response",
        "topDecision": {
            "id": "dec-1", "priority": "HIGH", "priorityScore": 0.95, "type": "MARKET", 
            "trigger": "market", "title": "Sell Crop", "confidence": 92, "expiresAt": "2026-07-12T00:00:00Z", "rawFacts": {},
            "reason": ["Based on available data, you should sell."],
            "expectedImpact": "Impact", "followUp": ["Action"], "sources": []
        }
    }
    with pytest.raises(ValueError, match="generic filler phrase"):
        ResponseValidator.validate(raw_dict)

def test_source_validation_failure():
    raw_dict = {
        "summary": "Valid response",
        "topDecision": {
            "id": "dec-1", "priority": "HIGH", "priorityScore": 0.95, "type": "MARKET", 
            "trigger": "market", "title": "Sell Crop", "confidence": 92, "expiresAt": "2026-07-12T00:00:00Z", "rawFacts": {},
            "reason": ["Reason"],
            "expectedImpact": "Impact", "followUp": ["Action"], 
            "sources": [{"name": "Hallucinated Source AI", "type": "AI", "freshness": "Live"}]
        }
    }
    request = AIRequest(farmer_id="1", market={"some": "data"})
    with pytest.raises(ValueError, match="hallucinated source"):
        ResponseValidator.validate(raw_dict, request=request)
