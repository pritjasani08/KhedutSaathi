import pandas as pd
import numpy as np

def main():
    try:
        print("[INFO] Starting conflict resolution script...")
        
        # 1. Load dataset
        input_path = 'dataset/all_india_crop_recommendation.csv'
        print(f"[INFO] Loading dataset from: {input_path}")
        df = pd.read_csv(input_path)
        
        original_rows = len(df)
        
        # Define input columns and target
        input_cols = [
            'State', 
            'District', 
            'Soil_Type', 
            'Water_Availability', 
            'Season', 
            'Crop_Duration_Months'
        ]
        
        # 2. & 3. Group by unique combinations and find most frequent Recommended_Crop
        print("[INFO] Identifying unique input combinations and resolving conflicts...")
        original_unique_combinations = len(df.groupby(input_cols))
        
        # Aggregating by finding the mode (most frequent item)
        # using value_counts().index[0] to reliably get the most frequent crop
        cleaned_df = df.groupby(input_cols, as_index=False).agg(
            Recommended_Crop=('Recommended_Crop', lambda x: x.value_counts().index[0])
        )
        
        # 4. Keep only one row per unique input combination
        cleaned_rows = len(cleaned_df)
        total_conflicts_resolved = original_rows - cleaned_rows
        
        # 5. Output columns will naturally remain the same order: input_cols + [Recommended_Crop]
        
        # 7. Print stats
        print(f"\nOriginal Rows: {original_rows}")
        print(f"Original Unique Combinations: {original_unique_combinations}")
        print(f"Cleaned Rows: {cleaned_rows}")
        print(f"Total Conflicts Resolved: {total_conflicts_resolved}\n")
        
        # 8. Print top 20 crops after cleaning
        print("Top 20 crops after cleaning:")
        top_20_crops = cleaned_df['Recommended_Crop'].value_counts().head(20)
        for i, (crop, count) in enumerate(top_20_crops.items(), start=1):
            print(f"{i}. {crop} ({count} instances)")
            
        # 6. Save cleaned dataset
        output_path = 'dataset/all_india_crop_recommendation_clean.csv'
        print(f"\n[INFO] Saving cleaned dataset to: {output_path}")
        cleaned_df.to_csv(output_path, index=False)
        print("[INFO] Cleaned dataset saved successfully!")

    except FileNotFoundError:
        print("[ERROR] Dataset file not found. Please ensure 'dataset/all_india_crop_recommendation.csv' exists.")
    except Exception as e:
        print(f"[ERROR] An unexpected error occurred: {str(e)}")

if __name__ == "__main__":
    main()
