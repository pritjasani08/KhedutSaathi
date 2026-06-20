import sys
import json
import argparse
from src.inference import DiseasePredictor

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--image', required=True)
    args = parser.parse_args()

    try:
        predictor = DiseasePredictor()
        result = predictor.predict_image(args.image)
        
        if result['details'] is None:
            result['error'] = False
            result['details'] = None

        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": True, "message": str(e)}))

if __name__ == "__main__":
    main()