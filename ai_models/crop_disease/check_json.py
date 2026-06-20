import json

JSON_PATH = "data/disease_info.json"

with open(JSON_PATH, "r", encoding="utf-8") as f:
    data = json.load(f)

key = "bean_angular_leaf_spot"

if key in data:
    print("✅ Found:", key)
else:
    print("❌ Not Found:", key)

    matches = [k for k in data.keys() if "angular" in k.lower()]
    print("\nSimilar keys:")
    for m in matches:
        print("-", m)