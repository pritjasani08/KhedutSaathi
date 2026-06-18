import pandas as pd

df = pd.read_csv("dataset/yield.csv")

print("Missing Values:\n")
print(df.isnull().sum())

print("\nDuplicate Rows:")
print(df.duplicated().sum())