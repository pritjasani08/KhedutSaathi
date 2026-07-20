import os
import json
import random
import sys

# Ensure project root is in python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from rag_system.src.chroma_manager import ChromaDBManager

BENCHMARK_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../knowledge/benchmark_dataset.json'))

def generate_benchmarks(target_count=100):
    print(f"Generating up to {target_count} deterministic benchmark questions...")
    chroma = ChromaDBManager()
    collection = chroma.collection
    
    # Extract all chunks
    results = collection.get(include=["metadatas"])
    metadatas = results.get("metadatas", [])
    
    if not metadatas:
        print("No chunks found in the repository to generate benchmarks from.")
        return
        
    benchmarks = []
    
    # Shuffle to get a random distribution
    random.seed(42)  # Fixed seed for deterministic shuffling
    shuffled_metadatas = list(metadatas)
    random.shuffle(shuffled_metadatas)
    
    seen_sections = set()
    
    for meta in shuffled_metadatas:
        doc_id = meta.get("source", "Unknown")
        section = meta.get("section", "General")
        
        # Avoid duplicate sections from the same document
        unique_key = f"{doc_id}::{section}"
        if unique_key in seen_sections:
            continue
            
        seen_sections.add(unique_key)
        
        crop = meta.get("crop", "Unknown")
        topic = meta.get("topic", "Unknown")
        acq_source = meta.get("source", "Unknown") # the extended metadata source, fallback doc_id
        
        # Formulate deterministic question
        if crop != "Unknown" and crop is not None:
            question = f"What does the {section} section say about {crop}?"
        else:
            doc_title_clean = str(doc_id).replace(".pdf", "").replace("_", " ")
            question = f"What is the information regarding {section} in {doc_title_clean}?"
            
        benchmarks.append({
            "question": question,
            "expected": {
                "document": doc_id,
                "crop": crop,
                "topic": topic,
                "source": acq_source,
                "section": section
            }
        })
        
        if len(benchmarks) >= target_count:
            break
            
    with open(BENCHMARK_PATH, 'w', encoding='utf-8') as f:
        json.dump(benchmarks, f, indent=4)
        
    print(f"Generated {len(benchmarks)} benchmark questions at {BENCHMARK_PATH}")

if __name__ == "__main__":
    generate_benchmarks()
