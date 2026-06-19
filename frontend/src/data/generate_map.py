import pandas as pd
import json

df = pd.read_csv(r"c:\Users\amit0\Desktop\MyProjects\KhedutSaathi\ai_models\crop_recommendation\dataset\all_india_crop_recommendation_clean.csv")

state_district_map = {}
for state in df['State'].unique():
    # Get sorted unique districts for this state
    districts = sorted(df[df['State'] == state]['District'].unique().tolist())
    state_district_map[state] = districts

js_content = f"export const stateDistrictMap = {json.dumps(state_district_map, indent=2)};\n"

with open(r"c:\Users\amit0\Desktop\MyProjects\KhedutSaathi\frontend\src\data\stateDistrictMap.js", "w", encoding="utf-8") as f:
    f.write(js_content)

print("stateDistrictMap.js generated successfully!")
