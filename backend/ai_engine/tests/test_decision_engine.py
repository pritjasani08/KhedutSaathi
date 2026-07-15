import json
from ..schemas import AIRequest
from ..decision_engine import DecisionEngine
from ..prompt_builder import PromptBuilder

def test_engine():
    # 1. Create a static FarmContext payload
    payload = {
        "farmer_id": "123",
        "profile": {"name": "Test Farmer", "district": "Rajkot", "state": "Gujarat"},
        "weather": {
            "forecast": [
                {"day": "Tomorrow", "condition": "Rain", "chance": 85}
            ]
        },
        "market": {
            "mandi": "APMC Rajkot",
            "trends": [
                {"commodity": "Wheat", "modal_price": 2400, "average_price": 2500, "trend": -4.0}
            ]
        },
        "yield_predictions": [],
        "disease_history": [
            {"disease_name": "Leaf Blight", "status": "active"}
        ],
        "crop_recommendations": [],
        "dataFreshness": {
            "weather": "Live",
            "market": "1 hour ago"
        }
    }

    request = AIRequest(**payload)

    # 2. Test Decision Engine
    candidates = DecisionEngine.generate_candidates(request)
    print(f"Generated {len(candidates)} candidates.")
    for c in candidates:
        print(f" - [{c.priorityScore}] {c.title} (Trigger: {c.trigger})")

    # 3. Test Prompt Builder
    documents = [
        "Leaf Blight spreads quickly in high humidity (>80% chance of rain). Apply fungicide immediately.",
        "Wheat prices in Rajkot typically recover within 3-5 days after a temporary dip."
    ]
    
    prompt = PromptBuilder.build_prompt(request, candidates, documents)
    print("\n--- GENERATED PROMPT ---")
    print(prompt)
    print("------------------------")

if __name__ == "__main__":
    test_engine()
