# KhedutSaathi - Crop Recommendation Dataset Cleaning
# Starter code for future dataset cleaning and preprocessing

import pandas as pd

def clean_data(input_path, output_path):
    print(f"Cleaning dataset from {input_path}...")
    
    try:
        # df = pd.read_csv(input_path)
        
        # TODO: Handle missing values (e.g. dropna(), fillna())
        
        # TODO: Remove duplicates
        
        # TODO: Standardize column names (lowercase, replace spaces)
        
        # TODO: Filter outliers or irrelevant data
        
        # df.to_csv(output_path, index=False)
        print(f"Cleaned dataset saved to {output_path}")
        pass
    except Exception as e:
        print(f"Error cleaning dataset: {e}")

if __name__ == "__main__":
    # TODO: Pass actual dataset paths
    clean_data("../dataset/raw_data.csv", "../dataset/cleaned_data.csv")
