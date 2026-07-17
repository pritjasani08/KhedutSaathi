import json
from typing import Dict, Any

class OutputFormatter:
    @staticmethod
    def format_groq_response(raw_json_str: str) -> Dict[str, Any]:
        """
        Parses and cleans the raw JSON string from Groq.
        Removes any markdown code blocks (e.g., ```json) that the LLM might have output.
        """
        clean_str = raw_json_str.strip()
        if clean_str.startswith("```json"):
            clean_str = clean_str[7:]
        elif clean_str.startswith("```"):
            clean_str = clean_str[3:]
            
        if clean_str.endswith("```"):
            clean_str = clean_str[:-3]
            
        clean_str = clean_str.strip()
        
        try:
            return json.loads(clean_str)
        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to parse Groq response as JSON. Error: {e}\nRaw output: {raw_json_str}")
