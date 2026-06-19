import joblib
import pandas as pd
import numpy as np

print("Loading model...")

# Load model and encoders
model = joblib.load("../models/crop_recommendation_model.pkl")
feature_encoder = joblib.load("../models/feature_encoder.pkl")
target_encoder = joblib.load("../models/target_encoder.pkl")

# Sample Input
# Gujarat,BANAS KANTHA,Red Soil,Low,Kharif,5
sample = pd.DataFrame([{
    "State": "Gujarat",
    "District": "BANAS KANTHA",
    "Soil_Type": "Red Soil",    
    "Water_Availability": "Low",
    "Season": "Kharif",
    "Crop_Duration_Months": 5
}])

try:
    # Encode only categorical columns
    categorical_features = sample[
        [
            "State",
            "District",
            "Soil_Type",
            "Water_Availability",
            "Season"
        ]
    ]

    encoded_cat = feature_encoder.transform(categorical_features)

    # Add numeric duration column
    duration = sample[["Crop_Duration_Months"]].values

    # Combine features exactly as training
    final_features = np.hstack([encoded_cat, duration])

    # Predict probabilities
    probabilities = model.predict_proba(final_features)[0]

    # Top 3 predictions
    top3_idx = np.argsort(probabilities)[-3:][::-1]

    print("\n===================================")
    print("TOP 3 RECOMMENDED CROPS")
    print("===================================\n")

    for rank, idx in enumerate(top3_idx, start=1):
        crop = target_encoder.inverse_transform([idx])[0]
        confidence = probabilities[idx] * 100

        print(
            f"{rank}. {crop} - {confidence:.2f}%"
        )

except Exception as e:
    print(f"\nERROR: {e}")