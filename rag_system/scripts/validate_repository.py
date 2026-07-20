import os
import json
import sys

# Ensure project root is in python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from rag_system.src.chroma_manager import ChromaDBManager

REPORT_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../knowledge/repository_health_report.md'))

def generate_report():
    print("Validating Knowledge Repository Health and Coverage...")
    
    chroma = ChromaDBManager()
    
    # Extract all chunks
    collection = chroma.collection
    results = collection.get(include=["metadatas"])
    
    metadatas = results.get("metadatas", [])
    
    total_chunks = len(metadatas)
    docs_set = set()
    sources = {}
    crops = {}
    topics = {}
    
    chunks_missing_crop = 0
    chunks_missing_topic = 0
    chunks_missing_source = 0
    
    for meta in metadatas:
        doc_id = meta.get("source", "Unknown")
        docs_set.add(doc_id)
        
        # We also have "source" from acquisition metadata now, but the standard chunk source is documentId.
        # Let's check for the new metadata schema.
        acq_source = meta.get("source", "Unknown") # actually 'source' in our expanded metadata might overwrite 'source' (docId) or vice versa!
        # Wait, in indexer.py, we set "source": chunk["documentId"], then we update metadata[key] = val.
        # So "source" in extended metadata overwrites "source" from indexer if it exists.
        
        # Let's just track overall distribution
        crop = meta.get("crop", "Unknown")
        topic = meta.get("topic", "Unknown")
        
        if crop == "Unknown" or not crop:
            chunks_missing_crop += 1
        else:
            crops[crop] = crops.get(crop, 0) + 1
            
        if topic == "Unknown" or not topic:
            chunks_missing_topic += 1
        else:
            topics[topic] = topics.get(topic, 0) + 1
            
        sources[acq_source] = sources.get(acq_source, 0) + 1

    total_docs = len(docs_set)
    
    # Generate Markdown Report
    report = f"""# Agricultural Knowledge Repository Health & Coverage Report

## Overall Health
- **Total Documents**: {total_docs}
- **Total Semantic Chunks**: {total_chunks}
- **Average Chunks per Document**: {total_chunks / max(1, total_docs):.2f}

## Metadata Integrity
- **Chunks Missing Crop**: {chunks_missing_crop} ({(chunks_missing_crop/max(1, total_chunks))*100:.1f}%)
- **Chunks Missing Topic**: {chunks_missing_topic} ({(chunks_missing_topic/max(1, total_chunks))*100:.1f}%)

## Coverage Report

### Top Crops Represented (Chunks)
"""
    for crop, count in sorted(crops.items(), key=lambda x: x[1], reverse=True)[:10]:
        report += f"- **{crop}**: {count}\n"

    report += "\n### Top Topics Represented (Chunks)\n"
    for topic, count in sorted(topics.items(), key=lambda x: x[1], reverse=True)[:10]:
        report += f"- **{topic}**: {count}\n"
        
    with open(REPORT_PATH, 'w', encoding='utf-8') as f:
        f.write(report)
        
    print(f"Validation complete. Report saved to {REPORT_PATH}")

if __name__ == "__main__":
    generate_report()
