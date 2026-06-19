from inference import DiseasePredictor
from gemini_service import get_treatment_info
from treatment_formatter import clean_and_format_response
import json

def process_diagnosis_request(image_path):
    """
    Future API Entry Point for /api/crop-diagnosis
    1. Predict disease from image using local MobileNetV3 model
    2. Get treatment from Gemini (Text only)
    3. Format response
    """
    
    # Step 1: Predict Disease locally
    predictor = DiseasePredictor()
    try:
        prediction = predictor.predict_image(image_path)
    except Exception as e:
        return {"error": f"Model prediction failed: {str(e)}"}
        
    crop = prediction['crop']
    disease = prediction['disease']
    confidence = prediction['confidence']
    
    if disease.lower() == "healthy" or "healthy" in disease.lower():
         return clean_and_format_response(
             "Farmer Advice:\nCrop is healthy. Continue standard care.",
             crop, disease, confidence
         )
         
    # Step 2: Get AI Treatment Advice
    try:
        raw_gemini_response = get_treatment_info(crop, disease)
    except Exception as e:
        return {"error": f"AI service failed: {str(e)}"}
        
    # Step 3: Format and return
    formatted_response = clean_and_format_response(
        raw_gemini_response, 
        crop, 
        disease, 
        confidence
    )
    
    return formatted_response

if __name__ == "__main__":
    # Example usage for testing integration later
    pass
