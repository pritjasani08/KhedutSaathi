import pandas as pd

df = pd.read_csv("dataset/yield.csv")

print(df[["Area", "Production", "Yield"]].head(20))