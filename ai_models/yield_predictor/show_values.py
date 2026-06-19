import pandas as pd

df = pd.read_csv("dataset/final_yield.csv")

print("States:")
print(df["State"].unique()[:20])

print("\nSeasons:")
print(df["Season"].unique())

print("\nCrops:")
print(df["Crop"].unique()[:20])