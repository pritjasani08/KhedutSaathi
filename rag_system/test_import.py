import traceback

print("START")

try:
    from sentence_transformers import SentenceTransformer
    print("IMPORT SUCCESS")
except Exception as e:
    print("ERROR:")
    print(e)
    traceback.print_exc()

print("END")