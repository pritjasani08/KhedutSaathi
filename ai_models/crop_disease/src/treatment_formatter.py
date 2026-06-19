import re

def clean_and_format_response(gemini_output, crop_name, disease_name, confidence=0.0):
    """
    Parses the structured output from Gemini into a clean JSON dictionary.
    Removes markdown noise and unnecessary explanations.
    """
    
    # Initialize the structured dictionary
    result = {
        "crop": crop_name,
        "disease": disease_name,
        "confidence": confidence,
        "symptoms": [],
        "cause": "",
        "organic_treatment": [],
        "chemical_treatment": [],
        "prevention": [],
        "farmer_advice": ""
    }
    
    def extract_list(section_text):
        items = []
        for line in section_text.split('\n'):
            line = line.strip()
            if line.startswith('-') or line.startswith('*'):
                items.append(line[1:].strip())
            elif line and not line.startswith('#'):
                # fallback if they forgot bullet points
                items.append(line)
        return items
        
    patterns = {
        "symptoms": r"Symptoms:\s*(.*?)\s*(?=Cause:|$)",
        "cause": r"Cause:\s*(.*?)\s*(?=Organic Treatment:|$)",
        "organic_treatment": r"Organic Treatment:\s*(.*?)\s*(?=Chemical Treatment:|$)",
        "chemical_treatment": r"Chemical Treatment:\s*(.*?)\s*(?=Prevention:|$)",
        "prevention": r"Prevention:\s*(.*?)\s*(?=Farmer Advice:|$)",
        "farmer_advice": r"Farmer Advice:\s*(.*?)\s*(?=$)"
    }
    
    for key, pattern in patterns.items():
        match = re.search(pattern, gemini_output, re.DOTALL | re.IGNORECASE)
        if match:
            content = match.group(1).strip()
            if key in ["symptoms", "organic_treatment", "chemical_treatment", "prevention"]:
                result[key] = extract_list(content)
            else:
                result[key] = content.replace('\n', ' ').strip()
                
    return result
