import pandas as pd

df = pd.read_csv("dataset/final_yield.csv")

print(sorted(df["Crop"].unique()))