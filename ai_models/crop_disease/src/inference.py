import os
import torch
import warnings
from PIL import Image
from src.model_builder import build_model
from src.dataset_loader import get_transforms
from src.config import MODEL_SAVE_PATH, CLASSES_SAVE_PATH
from src.utils import load_classes, get_device, get_disease_details

warnings.filterwarnings('ignore')

class DiseasePredictor:
    def __init__(self):
        self.device = get_device()
        self.classes = load_classes(CLASSES_SAVE_PATH)
        self.model = build_model(len(self.classes))

        if os.path.exists(MODEL_SAVE_PATH):
            self.model.load_state_dict(
                torch.load(MODEL_SAVE_PATH, map_location=self.device)
            )
        else:
            raise FileNotFoundError(
                f"Model weights not found at: {MODEL_SAVE_PATH}"
            )

        self.model.to(self.device)
        self.model.eval()
        _, self.transform = get_transforms()

    def predict_image(self, image_path):
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found: {image_path}")

        image = Image.open(image_path).convert("RGB")
        input_tensor = self.transform(image).unsqueeze(0).to(self.device)

        with torch.no_grad():
            outputs = self.model(input_tensor)
            probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
            confidence, predicted_idx = torch.max(probabilities, dim=0)

        class_name = self.classes[predicted_idx.item()]
        
        details = get_disease_details(class_name)

        return {
            "prediction": class_name,
            "confidence": round(confidence.item() * 100, 2),
            "details": details
        }