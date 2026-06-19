import pandas as pd

df = pd.read_csv("dataset/final_yield.csv")

gujarat = df[df["State"] == "Gujarat"]

print(sorted(gujarat["District"].unique()))