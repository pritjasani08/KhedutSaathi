import json
from typing import List
from .schemas import AIRequest, CandidateDecision

class PromptBuilder:
    @staticmethod
    def build_prompt(context: AIRequest, candidates: List[CandidateDecision], documents: List[str]) -> str:
        """
        Assembles the strict prompt for Groq to explain and format the candidates.
        """
        
        candidates_json = json.dumps([c.model_dump() for c in candidates], indent=2)
        context_json = json.dumps(context.model_dump(), indent=2)
        
        # Format memory strictly
        memory_text = ""
        if context.memory or context.recent_decisions:
            memory_text = "### 4. Farmer Memory & History\n"
            if context.memory: memory_text += json.dumps(context.memory, indent=2) + "\n"
            if context.recent_decisions: memory_text += json.dumps(context.recent_decisions, indent=2) + "\n"
        
        rag_text = "\n\n".join([f"Document {i+1}:\n{doc}" for i, doc in enumerate(documents[:3])]) # Top 3 only
        
        prompt = f"""
You are an expert agricultural reasoning engine. Your ONLY job is to explain and prioritize the provided Candidate Decisions.
You MUST sound like an experienced agricultural expert. 

STRICT CONSTRAINTS:
- NEVER explain confidence scores.
- NEVER repeat priority labels.
- NEVER mention that you are an AI, a model, or "based on available data".
- NEVER produce filler sentences (e.g., "It appears", "The model predicts", "Likely", "May help").
- NEVER invent new decisions, fake numbers, prices, or weather data.
- NEVER invent memories. Only reference past crops, feedback, or preferences if they explicitly exist in the Farmer Memory & History section.
- IMPORTANT: If `dataFreshness.market` is "Unavailable", you MUST explicitly state in the reasoning that the decision is based ONLY on available weather, crop, yield, and historical data, and that live market data is unavailable.

### 1. Farm Context (Current Data)
{context_json}

### 2. Candidate Decisions (Pre-calculated actions)
{candidates_json}

### 3. Retrieved Agricultural Knowledge
{rag_text}

{memory_text}

### INSTRUCTIONS:
1. Review the Candidate Decisions.
2. Select the candidate with the highest 'priorityScore' as the 'topDecision'.
3. Assign a 'priority' string based on the priorityScore: "HIGH" (>= 0.8), "MEDIUM" (>= 0.5), "LOW" (< 0.5).
4. CRITICAL: Inherit the EXACT 'id', 'type', 'title', 'confidence', 'priorityScore', 'trigger', 'expiresAt', and 'rawFacts' from the candidate. DO NOT CHANGE A SINGLE CHARACTER OF THESE FIELDS.
5. Write a natural language 'reason' array explaining WHY this decision is recommended in expert agricultural terms. Use Farmer Memory to personalize the reasoning if applicable (e.g., referencing their preferred crops or past success).
6. Write an 'expectedImpact' string that is MEASURABLE and concise (maximum 2-3 sentences).
7. Write a 'followUp' list of EXACTLY 1 to 3 practical, actionable next steps. Each step MUST be under 12 words.
8. Populate the 'sources' array using ONLY the sources provided in the Farm Context or Candidate Decisions.
9. If you used Farmer Memory to personalize this explanation, populate the 'personalization_factors' array with 1-2 bullet points explicitly stating what memory was used (e.g. "✓ Based on your past success with Groundnut"). If no memory was used, leave it null.
10. Return the remaining candidates in the 'decisions' array, applying the exact same formatting rules.
11. You must respond in STRICT JSON matching this EXACT structure:
{{
  "summary": "...",
  "topDecision": {{
     "id": "...", "priority": "HIGH", "priorityScore": 0.9, "type": "MARKET", "trigger": "...", "title": "...", "confidence": 95, "expiresAt": "...", "rawFacts": {{}},
     "reason": ["..."], "expectedImpact": "...", "followUp": ["..."],
     "sources": [{{"name": "...", "type": "...", "freshness": "..."}}],
     "personalization_factors": ["..."]
  }},
  "decisions": [ ...same structure... ]
}}
"""
        return prompt
