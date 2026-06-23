import re

def clean_response(text: str) -> str:
    if not text:
        return text

    # Remove bold markdown symbols
    text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)
    
    # Remove markdown headings
    text = text.replace("###", "")
    text = text.replace("##", "")
    text = text.replace("#", "")

    # Normalize spacing (replace 3 or more newlines with exactly 2)
    text = re.sub(r'\n{3,}', '\n\n', text)

    return text.strip()
