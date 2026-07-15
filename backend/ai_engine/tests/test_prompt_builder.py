import pytest
from ..prompt_builder import PromptBuilder
from ..schemas import AIRequest, CandidateDecision

def test_prompt_builder():
    context = AIRequest(
        requestId="req-123",
        farmer_id="farmer-1",
        profile={"state": "Gujarat"},
        weather={"forecast": []},
        market={"trends": []},
        disease_history=[]
    )
    
    candidates = [
        CandidateDecision(
            id="dec-1",
            type="MARKET",
            title="Sell Wheat",
            trigger="market",
            priorityScore=0.9,
            confidence=90,
            expiresAt="2026-07-12T00:00:00Z",
            rawFacts={}
        )
    ]
    
    documents = ["Doc 1 text"]
    
    prompt = PromptBuilder.build_prompt(context, candidates, documents)
    
    assert "Gujarat" in prompt
    assert "Sell Wheat" in prompt
    assert "Doc 1 text" in prompt
    assert "DO NOT CHANGE A SINGLE CHARACTER OF THESE FIELDS" in prompt
