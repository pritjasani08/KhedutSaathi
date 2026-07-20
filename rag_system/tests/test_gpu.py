import os
import sys
import time
import torch

# Ensure project root is in python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from rag_system.src.embedder import get_embedder
from rag_system.src.config import EMBEDDING_MODEL_NAME

def run_test():
    print("Initializing Embedder...")
    embedder = get_embedder()
    
    print("\n" + "="*50)
    print("GPU MIGRATION DIAGNOSTICS")
    print("="*50)
    
    print(f"Torch Version:       {torch.__version__}")
    print(f"CUDA Version:        {torch.version.cuda if torch.version.cuda else 'N/A'}")
    print(f"CUDA Available:      {torch.cuda.is_available()}")
    
    gpu_name = torch.cuda.get_device_name(0) if torch.cuda.is_available() else "N/A"
    print(f"GPU Name:            {gpu_name}")
    
    selected_device = str(embedder.model.device)
    print(f"Selected Device:     {selected_device}")
    
    print(f"Embedding Model:     {EMBEDDING_MODEL_NAME}")
    
    try:
        dimension = embedder.model.get_sentence_embedding_dimension()
        print(f"Embedding Dimension: {dimension}")
    except Exception as e:
        print(f"Embedding Dimension: Unknown ({e})")
        
    print("="*50 + "\n")
    
    dummy_chunks = [f"This is sample agricultural chunk {i}. The weather is good for planting." for i in range(100)]
    
    print("Starting embedding of 100 sample chunks...")
    start_time = time.time()
    embeddings = embedder.embed_documents(dummy_chunks)
    end_time = time.time()
    
    print(f"\nEmbedded {len(embeddings)} chunks.")
    print(f"Total time taken: {end_time - start_time:.2f} seconds")
    
    if hasattr(embedder, 'cleanup_memory'):
        embedder.cleanup_memory()

if __name__ == "__main__":
    run_test()
