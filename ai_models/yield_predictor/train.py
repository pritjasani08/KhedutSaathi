import pandas as pd
import joblib
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score

# Load dataset
df = pd.read_csv("dataset/final_yield.csv")

# Encode text columns
le_state = LabelEncoder()
le_district = LabelEncoder()
le_crop = LabelEncoder()
le_season = LabelEncoder()
le_state_crop = LabelEncoder()
le_district_crop = LabelEncoder()

df["State"] = le_state.fit_transform(df["State"])
df["District"] = le_district.fit_transform(df["District"])
df["Crop"] = le_crop.fit_transform(df["Crop"])
df["Season"] = le_season.fit_transform(df["Season"])
df["State_Crop"] = le_state_crop.fit_transform(df["State_Crop"])
df["District_Crop"] = le_district_crop.fit_transform(df["District_Crop"])

# Features
X = df[
    [
        "State",
        "District",
        "Crop",
        "Year",
        "Season",
        "Area",
        "State_Crop",
        "District_Crop"
    ]
]

# Target
y = df["Yield"]

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

print("Training Model...")

# Train model
model = RandomForestRegressor(
    n_estimators=100,
    random_state=42,
    n_jobs=-1
)

model.fit(X_train, y_train)

print("Model Training Complete!")

# Predict
predictions = model.predict(X_test)

# Accuracy
score = r2_score(y_test, predictions)

print("R2 Score:", score)
joblib.dump(model, "model/yield_model.pkl")

print("Model Saved Successfully!")

joblib.dump(le_state, "model/state_encoder.pkl")
joblib.dump(le_district, "model/district_encoder.pkl")
joblib.dump(le_crop, "model/crop_encoder.pkl")
joblib.dump(le_season, "model/season_encoder.pkl")
joblib.dump(le_state_crop, "model/state_crop_encoder.pkl")
joblib.dump(le_district_crop, "model/district_crop_encoder.pkl")

print("Encoders Saved Successfully!")