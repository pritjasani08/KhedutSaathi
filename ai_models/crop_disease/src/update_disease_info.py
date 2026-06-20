import json
import os

def main():
    classes_path = os.path.join(os.path.dirname(__file__), '../model/classes.json')
    disease_path = os.path.join(os.path.dirname(__file__), '../data/disease_info.json')

    with open(classes_path, 'r', encoding='utf-8') as f:
        classes = json.load(f)

    with open(disease_path, 'r', encoding='utf-8') as f:
        disease_info = json.load(f)

    missing = []
    
    for cls in classes:
        if cls not in disease_info:
            missing.append(cls)
            
            # Determine crop and disease from name
            parts = cls.split('___') if '___' in cls else cls.split('_') if '_' in cls else cls.split(' ')
            crop = parts[0].capitalize()
            disease = " ".join(parts[1:]).capitalize() if len(parts) > 1 else cls
            
            # Check if healthy
            is_healthy = 'healthy' in cls.lower()
            
            if is_healthy:
                entry = {
                    "crop": crop,
                    "disease": "Healthy",
                    "status": "healthy",
                    "message": "The crop is healthy. Continue standard maintenance.",
                    "symptoms": ["No visible symptoms of disease"],
                    "prevention": ["Maintain current agricultural practices"],
                    "organic_treatment": ["No treatment required"],
                    "chemical_treatment": ["No treatment required"]
                }
            else:
                entry = {
                    "crop": crop,
                    "disease": disease,
                    "status": "Active",
                    "message": "Information pending.",
                    "symptoms": ["Information currently unavailable"],
                    "prevention": ["Information currently unavailable"],
                    "organic_treatment": ["Information currently unavailable"],
                    "chemical_treatment": ["Information currently unavailable"]
                }
                
            disease_info[cls] = entry

    # Save back
    with open(disease_path, 'w', encoding='utf-8') as f:
        json.dump(disease_info, f, indent=2)

    print("MISSING CLASSES REPORT:")
    for m in missing:
        print("-", m)
    print(f"Total missing: {len(missing)}")

if __name__ == '__main__':
    main()
