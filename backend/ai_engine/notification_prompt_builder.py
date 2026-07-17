import json
from typing import List
from schemas import NotificationRequest, NotificationCandidate

class NotificationPromptBuilder:
    @staticmethod
    def build_prompt(request: NotificationRequest, documents: List[str]) -> str:
        candidates_json = json.dumps([c.model_dump() for c in request.candidates], indent=2)
        profile_json = json.dumps(request.profile, indent=2)
        
        # Format memory strictly
        memory_text = ""
        if request.memory or request.recent_decisions:
            memory_text = "### 3. Farmer Memory & History\n"
            if request.memory: memory_text += json.dumps(request.memory, indent=2) + "\n"
            if request.recent_decisions: memory_text += json.dumps(request.recent_decisions, indent=2) + "\n"
        
        # Limit RAG context
        rag_text = "\n\n".join([f"Document {i+1}:\n{doc}" for i, doc in enumerate(documents[:3])])
        
        prompt = f"""
You are KhedutSaathi's Proactive AI Intelligence Engine. Your job is to EXPLAIN the provided Notification Candidates to the farmer.
You MUST NOT invent new alerts, change the priority, or hallucinate facts (prices, weather conditions).
The backend has deterministically identified these alerts based on real data. You simply provide the expert agricultural reasoning.

STRICT CONSTRAINTS:
- Inherit `id`, `type`, `title`, `priority`, `expiresAt`, and `rawFacts` EXACTLY as provided for each candidate. DO NOT CHANGE THEM.
- `message` should be a concise, expert synthesis (2-3 sentences max) of WHY this alert matters to the farmer given their profile, and what action they should take.
- Do NOT mention that you are an AI, a model, or "Based on the provided data". Speak directly as an expert advisor.
- Do NOT produce generic filler sentences.
- NEVER invent memories. Only reference past crops, feedback, or preferences if they explicitly exist in the Farmer Memory & History section.
- `sources` must ONLY contain names relevant to the alert.
- If you used Farmer Memory to personalize this alert, populate `personalization_factors` with 1-2 short bullet points stating what memory was used. Otherwise, leave it null.

### 1. Farmer Profile
{profile_json}

### 2. Notification Candidates
{candidates_json}

{memory_text}

### 4. Retrieved Agricultural Knowledge (Optional Context)
{rag_text}

### INSTRUCTIONS:
1. Review each Notification Candidate.
2. For each candidate, formulate the `message` explaining the alert and recommended action.
3. You must respond in STRICT JSON matching this EXACT structure:
{{
  "status": "success",
  "requestId": "{request.requestId}",
  "notifications": [
    {{
      "id": "...",
      "type": "...",
      "title": "...",
      "priority": "...",
      "expiresAt": "...",
      "rawFacts": {{}},
      "message": "...",
      "sources": [{{"name": "...", "type": "...", "freshness": "Live"}}],
      "personalization_factors": ["..."]
    }}
  ]
}}
"""
        return prompt
