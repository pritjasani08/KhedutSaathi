import torch
from PIL import Image
from model_builder import build_model
from dataset_loader import get_transforms
from config import MODEL_SAVE_PATH, CLASSES_SAVE_PATH
from utils import load_classes, get_device
import os

class DiseasePredictor:
    def __init__(self):
        self.device = get_device()
        self.classes = load_classes(CLASSES_SAVE_PATH)
        self.model = build_model(len(self.classes))
        
        if os.path.exists(MODEL_SAVE_PATH):
            self.model.load_state_dict(torch.load(MODEL_SAVE_PATH, map_location=self.device))
        else:
            print(f"Warning: Model weights not found at {MODEL_SAVE_PATH}")
            
        self.model.to(self.device)
        self.model.eval()
        
        _, self.transform = get_transforms()
        
    def predict_image(self, image_path):
        image = Image.open(image_path).convert('RGB')
        input_tensor = self.transform(image).unsqueeze(0).to(self.device)
        
        with torch.no_grad():
            outputs = self.model(input_tensor)
            probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
            confidence, predicted_idx = torch.max(probabilities, 0)
            
        class_name = self.classes[predicted_idx.item()]
        
        parts = class_name.split('___')
        if len(parts) == 2:
            crop = parts[0].replace('_', ' ')
            disease = parts[1].replace('_', ' ')
        else:
            crop = "Unknown"
            disease = class_name.replace('_', ' ')
            
        return {
            "crop": crop,
            "disease": disease,
            "confidence": round(confidence.item(), 4),
            "raw_class": class_name
        }
