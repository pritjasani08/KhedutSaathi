from sentence_transformers import SentenceTransformer

print("START")

model = SentenceTransformer("BAAI/bge-m3")

print("MODEL LOADED")

emb = model.encode(["cotton farming"])

print("EMBEDDING GENERATED")
print(len(emb[0]))