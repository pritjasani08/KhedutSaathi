from typing import Dict, Any, List
import json

def build_timeline_prompt(profile: Dict[str, Any], memory: Dict[str, Any], recent_decisions: List[Dict[str, Any]], candidates: List[Dict[str, Any]]) -> str:
    return f"""You are an expert agricultural AI assistant.
Your task is to enrich the provided timeline tasks with clear explanations of why they are needed, the expected impact, any risks if ignored, and next actions.

Farmer Profile: {json.dumps(profile)}
Candidates: {json.dumps(candidates)}

Return ONLY valid JSON matching this schema:
{{
  "tasks": [
    {{
      "id": "match_candidate_id",
      "task_type": "...",
      "title": "...",
      "description": "...",
      "scheduled_date": "...",
      "priority": "...",
      "source": "...",
      "confidence": 95,
      "rawFacts": {{}},
      "why": "Detailed explanation of why this is scheduled",
      "impact": "Expected positive outcome",
      "risks": "Risks of not doing it",
      "next_actions": ["step 1", "step 2"],
      "personalization_factors": ["based on soil type X", "due to crop Y"]
    }}
  ]
}}
"""
