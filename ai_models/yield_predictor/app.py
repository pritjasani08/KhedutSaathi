from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
import os

# Define the absolute directory where the model files are located
models_dir = os.path.join(os.path.dirname(__file__), "model")

# Load model
model = joblib.load(os.path.join(models_dir, "yield_model.pkl"))

# Load encoders
state_encoder = joblib.load(os.path.join(models_dir, "state_encoder.pkl"))
district_encoder = joblib.load(os.path.join(models_dir, "district_encoder.pkl"))
crop_encoder = joblib.load(os.path.join(models_dir, "crop_encoder.pkl"))
season_encoder = joblib.load(os.path.join(models_dir, "season_encoder.pkl"))
state_crop_encoder = joblib.load(os.path.join(models_dir, "state_crop_encoder.pkl"))
district_crop_encoder = joblib.load(os.path.join(models_dir, "district_crop_encoder.pkl"))
# Map frontend names to dataset names
crop_name_mapping = {
    "cotton": "Cotton(lint)",
    "moong": "Moong(Green Gram)",
    "mustard": "Rapeseed &Mustard"
}

def find_match(user_input, encoder, is_crop=False):
    user_input = user_input.strip().lower()

    if is_crop and user_input in crop_name_mapping:
        user_input_mapped = crop_name_mapping[user_input].lower()
    else:
        user_input_mapped = user_input

    for item in encoder.classes_:
        if str(item).lower() == user_input_mapped:
            return item

    raise HTTPException(
        status_code=400,
        detail=f"'{user_input}' not found in dataset"
    )
class PredictionRequest(BaseModel):
    state: str
    district: str
    crop: str
    season: str
    year: int
    area: float

@app.get("/")
def home():
    return {"message": "KhedutSaathi Yield Predictor API Running"}

@app.post("/predict")
def predict(data: PredictionRequest):
    try:
        state = find_match(data.state, state_encoder)
        district = find_match(data.district, district_encoder)
        crop = find_match(data.crop, crop_encoder, is_crop=True)
        season = find_match(data.season, season_encoder)

        state_crop = f"{state}_{crop}"
        district_crop = f"{district}_{crop}"

        # Fallback for unseen State_Crop combinations to prevent 400 errors
        if state_crop not in state_crop_encoder.classes_:
            fallback_sc = next((c for c in state_crop_encoder.classes_ if str(c).endswith(f"_{crop}")), state_crop_encoder.classes_[0])
            state_crop = fallback_sc
            
        # Fallback for unseen District_Crop combinations to prevent 400 errors
        if district_crop not in district_crop_encoder.classes_:
            fallback_dc = next((c for c in district_crop_encoder.classes_ if str(c).endswith(f"_{crop}")), district_crop_encoder.classes_[0])
            district_crop = fallback_dc

        input_data = pd.DataFrame([{
            "State": state_encoder.transform([state])[0],
            "District": district_encoder.transform([district])[0],
            "Crop": crop_encoder.transform([crop])[0],
            "Year": data.year,
            "Season": season_encoder.transform([season])[0],
            "Area": data.area,
            "State_Crop": state_crop_encoder.transform([state_crop])[0],
            "District_Crop": district_crop_encoder.transform([district_crop])[0]
        }])

        prediction = model.predict(input_data)

        return {
            "predicted_yield": round(float(prediction[0]), 2)
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))