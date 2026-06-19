import os
import torch
from PIL import Image
from model_builder import build_model
from dataset_loader import get_transforms
from config import MODEL_SAVE_PATH, CLASSES_SAVE_PATH
from utils import load_classes, get_device
class DiseasePredictor:
    def __init__(self):
        self.device = get_device()

        print(f"Loading classes from: {CLASSES_SAVE_PATH}")
        self.classes = load_classes(CLASSES_SAVE_PATH)

        print(f"Found {len(self.classes)} classes")

        self.model = build_model(len(self.classes))

        if os.path.exists(MODEL_SAVE_PATH):
            print(f"Loading model from: {MODEL_SAVE_PATH}")
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

        print(f"Using device: {self.device}")

    def extract_crop_and_disease(self, class_name):
        KNOWN_CROPS = [
            "cotton",
            "rice",
            "wheat",
            "sugarcane",
            "maize",
            "corn",
            "groundnut",
            "tomato",
            "potato",
            "apple",
            "grape",
            "bean",
            "pumpkin",
            "guava",
            "lemon",
            "peach",
            "strawberry",
            "cherry",
            "bell_pepper",
            "cucumber"
        ]

        crop = "Unknown"

        for c in KNOWN_CROPS:
            if c.lower() in class_name.lower():
                crop = c.replace("_", " ").title()
                break

        disease = class_name

        if crop != "Unknown":
            disease = disease.replace(crop, "")
            disease = disease.replace(crop.lower(), "")
            disease = disease.replace(crop.upper(), "")
            disease = disease.replace(" in ", " ")
            disease = disease.replace(" on ", " ")
            disease = disease.replace("_", " ")
            disease = disease.strip()

        disease = " ".join(disease.split())
        disease = disease.title()

        return crop, disease

    def predict_image(self, image_path):
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found: {image_path}")

        image = Image.open(image_path).convert("RGB")

        input_tensor = self.transform(image).unsqueeze(0).to(self.device)

        with torch.no_grad():
            outputs = self.model(input_tensor)

            probabilities = torch.nn.functional.softmax(
                outputs[0], dim=0
            )

            confidence, predicted_idx = torch.max(
                probabilities, dim=0
            )

        class_name = self.classes[predicted_idx.item()]

        crop, disease = self.extract_crop_and_disease(class_name)

        return {
            "crop": crop,
            "disease": disease,
            "confidence": round(confidence.item(), 4),
            "raw_class": class_name
        }
if __name__ == "__main__":
    predictor = DiseasePredictor()

    image_path = input("Enter image path: ").strip()

    result = predictor.predict_image(image_path)

    print("\nPrediction Result:")
    print(result)