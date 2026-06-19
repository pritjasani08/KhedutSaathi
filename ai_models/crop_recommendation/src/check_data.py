# KhedutSaathi - Crop Recommendation Dataset Inspection
# Starter code for dataset inspection and column checking

import pandas as pd

def inspect_dataset(file_path):
    print(f"--- Inspecting Dataset: {file_path} ---")
    try:
        # TODO: Load dataset
        # df = pd.read_csv(file_path)
        
        # TODO: Display basic info (df.info())
        
        # TODO: Display top 5 rows (df.head())
        
        # TODO: Check unique values for specific columns
        pass
    except FileNotFoundError:
        print(f"Error: Dataset {file_path} not found.")

if __name__ == "__main__":
    # TODO: Pass actual dataset path
    inspect_dataset("../dataset/placeholder.csv")
