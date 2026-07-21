"""
Generates a metadata quality report for the ChromaDB index to verify Intelligent Metadata Extraction.
Run: .\.venv\Scripts\python.exe rag_system\scripts\metadata_quality_report.py
"""
import sys
import os
from collections import Counter

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

try:
    from rag_system.src.chroma_manager import ChromaDBManager
except Exception as e:
    print(f"Failed to import RAG components: {e}")
    sys.exit(1)

def run_report():
    print("=" * 70)
    print("METADATA QUALITY REPORT — KhedutSaathi Knowledge Engine")
    print("=" * 70)
    
    manager = ChromaDBManager()
    collection = manager.collection
    
    count = collection.count()
    print(f"Total Chunks Indexed: {count}")
    
    if count == 0:
        print("No documents indexed. Run ingest_knowledge.py first.")
        return
        
    results = collection.get(include=["metadatas"])
    metadatas = results.get("metadatas", [])
    
    crops_counter = Counter()
    institutions_counter = Counter()
    states_counter = Counter()
    seasons_counter = Counter()
    
    for meta in metadatas:
        # crop might be an array or string
        crops_str = meta.get("crops", meta.get("crop", "General"))
        if isinstance(crops_str, str):
            for c in crops_str.split(", "):
                crops_counter[c] += 1
                
        institutions_counter[meta.get("institution", "Unknown")] += 1
        states_counter[meta.get("state", "Unknown")] += 1
        seasons_counter[meta.get("season", "Unknown")] += 1
        
    def print_counter(name, counter):
        print(f"\n--- {name} ---")
        for key, val in counter.most_common():
            print(f"{key}: {val}")

    print_counter("Crops", crops_counter)
    print_counter("Institutions", institutions_counter)
    print_counter("States", states_counter)
    print_counter("Seasons", seasons_counter)
    
    print("\n" + "=" * 70)
    
if __name__ == "__main__":
    run_report()
