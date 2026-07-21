from langchain_huggingface import HuggingFaceEmbeddings

print("START")

emb = HuggingFaceEmbeddings(
    model_name="BAAI/bge-m3",
    model_kwargs={"device": "cpu"},
    encode_kwargs={"normalize_embeddings": True}
)

print("LOADED")