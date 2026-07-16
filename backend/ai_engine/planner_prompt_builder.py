import json
from typing import List
from schemas import PlannerRequest

class PlannerPromptBuilder:
    @staticmethod
    def build_prompt(request: PlannerRequest, documents: List[str]) -> str:
        req_json = json.dumps(request.model_dump(), indent=2)
        
        # Format memory strictly
        memory_text = ""
        if request.memory or request.recent_decisions:
            memory_text = "### 2. Farmer Memory & History\n"
            if request.memory: memory_text += json.dumps(request.memory, indent=2) + "\n"
            if request.recent_decisions: memory_text += json.dumps(request.recent_decisions, indent=2) + "\n"
            
        # Limit RAG context
        rag_text = "\n\n".join([f"Document {i+1}:\n{doc}" for i, doc in enumerate(documents[:3])])
        
        prompt = f"""
You are an expert agricultural reasoning engine. Your job is to EXPLAIN the provided ML crop recommendation and yield predictions.
You MUST NOT invent new crops, alter the expected yield, or change the risk level. The ML models are the absolute source of truth.

STRICT CONSTRAINTS:
- Inherit `bestCrop`, `expectedYield`, and `riskLevel` EXACTLY as provided in the mlResults. DO NOT CHANGE THEM.
- `explanation` should be a concise, expert synthesis (2-4 sentences) of WHY the bestCrop is suitable given the weather, market, and farm conditions.
- `actionPlan` must be exactly 3 to 5 actionable steps for the farmer to prepare for this crop.
- `alternatives` must be a subset of the `recommendedCrops` list (excluding the `bestCrop`). Do NOT invent alternatives. Maximum 3 alternatives.
- Do NOT mention that you are an AI, a model, or "Based on the ML results". Speak directly as an expert advisor.
- Do NOT produce generic filler sentences.
- NEVER invent memories. Only reference past crops, feedback, or preferences if they explicitly exist in the Farmer Memory & History section.
- `sources` must ONLY contain names from the following list: 'Crop Recommendation Model', 'Yield Prediction Model', 'Weather', 'Market'.
- If you used Farmer Memory to personalize this explanation, populate `personalization_factors` with 1-2 bullet points explicitly stating what memory was used. Otherwise leave it null.

### 1. Planner Context
{req_json}

{memory_text}

### 3. Retrieved Agricultural Knowledge
{rag_text}

### INSTRUCTIONS:
1. Review the Planner Context and Retrieved Agricultural Knowledge.
2. Formulate the explanation, action plan, and source list.
3. You must respond in STRICT JSON matching this EXACT structure:
{{
  "status": "success",
  "requestId": "...",
  "bestCrop": "...",
  "expectedYield": 0.0,
  "riskLevel": "...",
  "explanation": "...",
  "actionPlan": ["..."],
  "alternatives": ["..."],
  "sources": [{{"name": "...", "type": "...", "freshness": "..."}}],
  "personalization_factors": ["..."]
}}
"""
        return prompt
