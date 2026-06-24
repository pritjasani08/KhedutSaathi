import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np

# Global variables to hold the loaded model and encoders
model = None
feature_encoder = None
target_encoder = None

# Realistic crop durations in months for filtering
CROP_DURATIONS = {
    'Alfalfa': 12, 'Almond': 12, 'Apple': 12, 'Apricot': 12, 'Arecanut': 12, 'Arhar': 6, 
    'Bajra': 3, 'Banana': 12, 'Barley': 4, 'Bay Leaf': 12, 'Beetroot': 3, 'Black Pepper': 12, 
    'Buckwheat': 3, 'Cabbage': 3, 'Capsicum': 4, 'Cardamom': 12, 'Carrot': 3, 'Cashew': 12, 
    'Castor': 6, 'Cauliflower': 3, 'Cherry': 12, 'Chickpea': 4, 'Chilli': 6, 'Clove': 12, 
    'Cocoa': 12, 'Coconut': 12, 'Coffee': 12, 'Coriander': 3, 'Cotton': 9, 'Cumin': 4, 
    'Dragon Fruit': 12, 'Fenugreek': 2, 'Garlic': 5, 'Ginger': 9, 'Gram': 4, 'Grapes': 12, 
    'Green Pea': 3, 'Groundnut': 4, 'Jackfruit': 12, 'Jhangora': 4, 'Jowar': 4, 'Jute': 5, 
    'Kiwi': 12, 'Large Cardamom': 12, 'Litchi': 12, 'Maize': 4, 'Mandua': 4, 'Mango': 12, 
    'Millet': 4, 'Mint': 2, 'Moong': 3, 'Mustard': 4, 'Naga Chilli': 6, 'Nutmeg': 12, 
    'Onion': 4, 'Orange': 12, 'Papaya': 12, 'Passion Fruit': 12, 'Pea': 3, 'Peach': 12, 
    'Pear': 12, 'Pepper': 12, 'Pineapple': 12, 'Plum': 12, 'Pomegranate': 12, 'Potato': 4, 
    'Radish': 2, 'Ragi': 4, 'Rajma': 4, 'Rice': 4, 'Rubber': 12, 'Saffron': 4, 
    'Sesamum': 3, 'Soyabean': 4, 'Soybean': 4, 'Spinach': 2, 'Sugarcane': 12, 'Sunflower': 4, 
    'Tapioca': 9, 'Tea': 12, 'Tobacco': 6, 'Tomato': 4, 'Tur': 8, 'Turmeric': 9, 
    'Turnip': 2, 'Urad': 3, 'Vegetables': 3, 'Walnut': 12, 'Wheat': 5
}

def get_crop_duration(crop_name):
    return CROP_DURATIONS.get(crop_name, 5) # Default to 5 months if not explicitly listed

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load model and encoders on startup
    global model, feature_encoder, target_encoder
    
    models_dir = os.path.join(os.path.dirname(__file__), '../models')
    try:
        model = joblib.load(os.path.join(models_dir, 'crop_recommendation_model.pkl'))
        feature_encoder = joblib.load(os.path.join(models_dir, 'feature_encoder.pkl'))
        target_encoder = joblib.load(os.path.join(models_dir, 'target_encoder.pkl'))
        print("Models loaded successfully.")
    except Exception as e:
        print(f"Error loading models: {e}")
        
    yield
    # Any cleanup code would go here

app = FastAPI(lifespan=lifespan)

# Add CORS support so React frontend can access API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictionRequest(BaseModel):
    state: str
    district: str
    soil_type: str
    water_availability: str
    season: str
    crop_duration_months: float

@app.get("/")
def read_root():
    return {"message": "Crop Recommendation API Running"}

@app.get("/health")
def read_health():
    return {"status": "healthy"}

@app.post("/predict")
def predict_crop(request: PredictionRequest):
    if model is None or feature_encoder is None or target_encoder is None:
        raise HTTPException(status_code=500, detail="Models are not loaded on server.")
        
    try:
        # Format input data to match training data exactly
        sample = pd.DataFrame([{
            "State": request.state,
            "District": request.district,
            "Soil_Type": request.soil_type,
            "Water_Availability": request.water_availability,
            "Season": request.season,
            "Crop_Duration_Months": request.crop_duration_months
        }])
        
        # Encode only categorical columns
        categorical_features = sample[[
            "State",
            "District",
            "Soil_Type",
            "Water_Availability",
            "Season"
        ]]
        
        encoded_cat = feature_encoder.transform(categorical_features)
        
        # Add numeric duration column
        duration = sample[["Crop_Duration_Months"]].values
        
        # Combine features exactly as training
        final_features = np.hstack([encoded_cat, duration])
        
        # Predict probabilities
        probabilities = model.predict_proba(final_features)[0]
        
        # Get top 20 most suitable crops for this environment (ignoring duration)
        top20_indices = np.argsort(probabilities)[-20:][::-1]
        
        user_duration = request.crop_duration_months
        candidate_crops = []
        
        for idx in top20_indices:
            crop = target_encoder.inverse_transform([idx])[0]
            prob = probabilities[idx]
            crop_duration = get_crop_duration(crop)
            
            # Calculate how far off the crop's duration is from what the user asked
            diff = abs(crop_duration - user_duration)
            
            candidate_crops.append({
                'crop': crop,
                'diff': diff,
                'prob': prob
            })
            
        # VERY IMPORTANT: Sort primarily by duration difference (ascending) so exact matches are first!
        # Secondary sort by environment suitability (descending).
        candidate_crops.sort(key=lambda x: (x['diff'], -x['prob']))
        
        # Extract the top 3 crops that match the requested duration best
        recommended_crops = [item['crop'] for item in candidate_crops[:3]]
            
        return {
            "recommended_crops": recommended_crops
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
