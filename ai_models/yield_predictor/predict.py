import joblib
import pandas as pd

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

    raise ValueError(f"'{user_input}' not found in dataset")

# Example Farmer Input
state = find_match(input("Enter State: "), state_encoder)
district = find_match(input("Enter District: "), district_encoder)
crop = find_match(input("Enter Crop: "), crop_encoder)
season = find_match(input("Enter Season: "), season_encoder)
year = int(input("Enter Year: "))
area = float(input("Enter Area: "))

# Create combined fields
state_crop = f"{state}_{crop}"
district_crop = f"{district}_{crop}"

# Encode values
state_encoded = state_encoder.transform([state])[0]
district_encoded = district_encoder.transform([district])[0]
crop_encoded = crop_encoder.transform([crop])[0]
season_encoded = season_encoder.transform([season])[0]
state_crop_encoded = state_crop_encoder.transform([state_crop])[0]
district_crop_encoded = district_crop_encoder.transform([district_crop])[0]

# Create input dataframe
input_data = pd.DataFrame([{
    "State": state_encoded,
    "District": district_encoded,
    "Crop": crop_encoded,
    "Year": year,
    "Season": season_encoded,
    "Area": area,
    "State_Crop": state_crop_encoded,
    "District_Crop": district_crop_encoded
}])

# Predict
prediction = model.predict(input_data)

print(f"Predicted Yield: {prediction[0]:.2f}")