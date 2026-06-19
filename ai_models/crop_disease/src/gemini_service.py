import os
import google.generativeai as genai
from dotenv import load_dotenv

# Path to the main KhedutSaathi/.env
ENV_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '.env'))

def get_gemini_client():
    load_dotenv(ENV_PATH)
    api_key = os.getenv("CROP_DISEASE_GEMINI_API_KEY")
    
    if not api_key:
        raise ValueError("CROP_DISEASE_GEMINI_API_KEY not found in .env file.")
        
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')
    return model

def get_treatment_info(crop_name, disease_name):
    """
    Sends crop and disease name to Gemini to get treatment information.
    NEVER sends image data.
    """
    prompt = f"""
    You are an expert agricultural scientist. Provide detailed information about the following crop disease.
    
    Crop Name: {crop_name}
    Disease Name: {disease_name}
    
    Respond STRICTLY in the following format. Do not use markdown blocks like ```json, just output the exact text structure below.
    
    Disease Name:
    [Full Disease Name]
    
    Symptoms:
    - [Symptom 1]
    - [Symptom 2]
    
    Cause:
    [Description of the cause]
    
    Organic Treatment:
    - [Step 1]
    - [Step 2]
    
    Chemical Treatment:
    - [Step 1]
    - [Step 2]
    
    Prevention:
    - [Step 1]
    - [Step 2]
    
    Farmer Advice:
    [General advice for the farmer]
    """
    
    model = get_gemini_client()
    response = model.generate_content(prompt)
    
    return response.text
