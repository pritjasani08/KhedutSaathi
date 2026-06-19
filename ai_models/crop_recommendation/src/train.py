import pandas as pd
import numpy as np
import joblib
import json
import os
import datetime
import time
from sklearn.preprocessing import OrdinalEncoder, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

def main():
    try:
        # Automatically create models folder if not exists
        os.makedirs('models', exist_ok=True)

        # 1. Load cleaned dataset
        dataset_path = 'dataset/all_india_crop_recommendation_clean.csv'
        df = pd.read_csv(dataset_path)
        print("[INFO] Dataset Loaded")

        # Extract basic stats
        total_rows, total_columns = df.shape
        total_states = df['State'].nunique()
        total_districts = df['District'].nunique()
        total_crops = df['Recommended_Crop'].nunique()

        # 8. Print before training
        print(f"Dataset Shape: {df.shape}")
        print(f"Total States: {total_states}")
        print(f"Total Districts: {total_districts}")
        print(f"Total Crops: {total_crops}")

        # Features and Target
        input_columns = ['State', 'District', 'Soil_Type', 'Water_Availability', 'Season', 'Crop_Duration_Months']
        categorical_features = ['State', 'District', 'Soil_Type', 'Water_Availability', 'Season']
        target_column = 'Recommended_Crop'

        X = df[input_columns]
        y = df[target_column]

        # Encode categorical features using OrdinalEncoder
        feature_encoder = OrdinalEncoder()
        X_encoded = X.copy()
        X_encoded[categorical_features] = feature_encoder.fit_transform(X[categorical_features])

        # Encode Target using LabelEncoder
        target_encoder = LabelEncoder()
        y_encoded = target_encoder.fit_transform(y)
        
        print("\n[INFO] Encoding Complete")

        # Train/Test Split
        X_train, X_test, y_train, y_test = train_test_split(
            X_encoded, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
        )

        print("[INFO] Training Started")
        
        # Track training time
        start_time = time.time()
        
        # 7. Updated model parameters
        model = RandomForestClassifier(
            n_estimators=200,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )
        model.fit(X_train, y_train)
        
        training_time = time.time() - start_time
        print("[INFO] Training Completed")

        # Calculate Accuracies
        y_train_pred = model.predict(X_train)
        y_test_pred = model.predict(X_test)

        training_accuracy = accuracy_score(y_train, y_train_pred)
        testing_accuracy = accuracy_score(y_test, y_test_pred)

        # 9. Print after training
        print(f"\nTraining Accuracy: {training_accuracy * 100:.2f}%")
        print(f"Testing Accuracy: {testing_accuracy * 100:.2f}%")
        
        print("\nClassification Report:")
        print(classification_report(y_test, y_test_pred, target_names=target_encoder.classes_))

        # 12. Add feature importance report
        print("\nTop 10 Most Important Features:")
        importances = model.feature_importances_
        indices = np.argsort(importances)[::-1]
        
        top_n = min(10, len(input_columns))
        for i in range(top_n):
            print(f"{i+1}. {input_columns[indices[i]]} ({importances[indices[i]]:.4f})")

        # 10. Save models and encoders
        model_path = 'models/crop_recommendation_model.pkl'
        feature_encoder_path = 'models/feature_encoder.pkl'
        target_encoder_path = 'models/target_encoder.pkl'
        feature_columns_path = 'models/feature_columns.pkl'
        metadata_path = 'models/model_metadata.json'

        joblib.dump(model, model_path)
        joblib.dump(feature_encoder, feature_encoder_path)
        joblib.dump(target_encoder, target_encoder_path)
        joblib.dump(input_columns, feature_columns_path)

        print("\n[INFO] Model Saved")

        # 11. Calculate and print model file size and training time
        model_size_bytes = os.path.getsize(model_path)
        model_size_mb = model_size_bytes / (1024 * 1024)
        
        print(f"Training Time: {training_time:.2f} seconds")
        print(f"Model File Size: {model_size_mb:.2f} MB\n")

        # Create and store metadata
        current_datetime = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        metadata = {
            "model_type": "RandomForestClassifier",
            "dataset_rows": total_rows,
            "dataset_columns": total_columns,
            "number_of_states": total_states,
            "number_of_districts": total_districts,
            "number_of_crops": total_crops,
            "training_accuracy": round(training_accuracy * 100, 2),
            "testing_accuracy": round(testing_accuracy * 100, 2),
            "training_time_seconds": round(training_time, 2),
            "model_size_mb": round(model_size_mb, 2),
            "training_date": current_datetime
        }

        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=4)

        # Final Output
        print("===================================")
        print("MODEL TRAINING COMPLETED")
        print("===================================")
        print(f"Training Accuracy: {training_accuracy * 100:.2f}%")
        print(f"Testing Accuracy: {testing_accuracy * 100:.2f}%")
        print(f"Training Time: {training_time:.2f} seconds")
        print(f"Model File Size: {model_size_mb:.2f} MB")
        print("\nFiles Saved:\n")
        print("crop_recommendation_model.pkl")
        print("feature_encoder.pkl")
        print("target_encoder.pkl")
        print("feature_columns.pkl")
        print("model_metadata.json\n")

    except Exception as e:
        print(f"[ERROR] An error occurred during execution: {str(e)}")

if __name__ == "__main__":
    main()
