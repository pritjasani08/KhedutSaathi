import pandas as pd

df = pd.read_csv("dataset/yield.csv")

# Remove Production column
df = df.drop(columns=["Production"])

# Save cleaned dataset
df.to_csv("dataset/final_yield.csv", index=False)

print("Final Dataset Shape:")
print(df.shape)

print("\nColumns:")
print(df.columns)