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
        
        # Top 3 predictions
        top3_idx = np.argsort(probabilities)[-3:][::-1]
        
        recommended_crops = []
        for idx in top3_idx:
            crop = target_encoder.inverse_transform([idx])[0]
            recommended_crops.append(crop)
            
        return {
            "recommended_crops": recommended_crops
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
