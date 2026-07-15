import pytest
from ..output_formatter import OutputFormatter

def test_clean_json_blocks():
    raw_markdown = "```json\n{\"status\": \"success\"}\n```"
    result = OutputFormatter.format_groq_response(raw_markdown)
    assert result["status"] == "success"

def test_clean_text_blocks():
    raw_markdown = "```\n{\"status\": \"success\"}\n```"
    result = OutputFormatter.format_groq_response(raw_markdown)
    assert result["status"] == "success"

def test_raw_json():
    raw_json = "{\"status\": \"success\"}"
    result = OutputFormatter.format_groq_response(raw_json)
    assert result["status"] == "success"

def test_invalid_json():
    invalid_json = "{\"status\": \"success\""
    with pytest.raises(ValueError, match="Failed to parse Groq response"):
        OutputFormatter.format_groq_response(invalid_json)
