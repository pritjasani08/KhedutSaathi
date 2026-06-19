from inference import DiseasePredictor
import json

def main():

    predictor = DiseasePredictor()

    image_path = "src/testing.png"

    result = predictor.predict_image(image_path)

    print("\n===== PREDICTION RESULT =====\n")
    print(json.dumps(result, indent=4))

if __name__ == "__main__":
    main()