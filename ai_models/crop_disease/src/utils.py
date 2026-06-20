import json
import torch
import os
from src.config import MODEL_SAVE_DIR

def save_classes(classes, filepath):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w') as f:
        json.dump(classes, f, indent=4)

def load_classes(filepath):
    with open(filepath, 'r') as f:
        return json.load(f)

def get_device():
    return torch.device("cuda" if torch.cuda.is_available() else "cpu")

def get_disease_details(predicted_class):
    info_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'disease_info.json')
    if not os.path.exists(info_path):
        return None
    try:
        with open(info_path, 'r', encoding='utf-8') as f:
            disease_db = json.load(f)
            if predicted_class in disease_db:
                entry = disease_db[predicted_class]
                # ALWAYS fetch crop and other details directly from JSON
                return {
                    "crop": entry.get("crop", "Unknown"),
                    "disease": entry.get("disease", "Unknown"),
                    "status": entry.get("status", "Active"),
                    "message": entry.get("message", ""),
                    "symptoms": entry.get("symptoms", []),
                    "prevention": entry.get("prevention", []),
                    "organic_treatment": entry.get("organic_treatment", []),
                    "chemical_treatment": entry.get("chemical_treatment", [])
                }
            return None
    except Exception as e:
        return None
