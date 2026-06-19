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
# Load model
model = joblib.load("model/yield_model.pkl")

# Load encoders
state_encoder = joblib.load("model/state_encoder.pkl")
district_encoder = joblib.load("model/district_encoder.pkl")
crop_encoder = joblib.load("model/crop_encoder.pkl")
season_encoder = joblib.load("model/season_encoder.pkl")
state_crop_encoder = joblib.load("model/state_crop_encoder.pkl")
district_crop_encoder = joblib.load("model/district_crop_encoder.pkl")
def find_match(user_input, encoder):
    user_input = user_input.strip().lower()

    for item in encoder.classes_:
        if item.lower() == user_input:
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

    state = find_match(data.state, state_encoder)
    district = find_match(data.district, district_encoder)
    crop = find_match(data.crop, crop_encoder)
    season = find_match(data.season, season_encoder)

    state_crop = f"{state}_{crop}"
    district_crop = f"{district}_{crop}"

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