"""
Quick diagnostic: prints ChromaDB collection stats and top 5 results for a sample query.
Run: .\.venv\Scripts\python.exe rag_system\scripts\inspect_db.py
"""
import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from rag_system.src.chroma_manager import ChromaDBManager

c = ChromaDBManager()
total = c.collection.count()
print(f"\n=== ChromaDB Stats ===")
print(f"Total chunks indexed: {total}")

if total > 0:
    # Peek at a sample
    sample = c.collection.peek(5)
    print(f"\nSample metadata (first 5 chunks):")
    for i, meta in enumerate(sample.get('metadatas', [])):
        print(f"  [{i+1}] source={meta.get('source')} | crop={meta.get('crop')} | region={meta.get('region')} | section={meta.get('section','')[:60]}")
    
    # Test a retrieval
    print(f"\n=== Test Query: 'cotton irrigation water requirement' ===")
    query_emb = c.embedder.embed_query("cotton irrigation water requirement")
    results = c.collection.query(query_embeddings=[query_emb], n_results=5)
    docs = results.get('documents', [[]])[0]
    metas = results.get('metadatas', [[]])[0]
    dists = results.get('distances', [[]])[0]
    for i, (doc, meta, dist) in enumerate(zip(docs, metas, dists)):
        score = round(1.0 - dist, 4)
        print(f"\n  Rank {i+1} | Score: {score} | Source: {meta.get('source')} | Section: {meta.get('section','')[:50]}")
        print(f"  Text preview: {doc[:150].replace(chr(10),' ')}")
else:
    print("WARNING: ChromaDB is empty. Ingestion may still be running.")
