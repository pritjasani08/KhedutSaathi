import os
import sys
import logging

# Ensure project root is in python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from rag_system.src.chroma_manager import ChromaDBManager

def validate_hierarchy():
    manager = ChromaDBManager()
    
    # Retrieve all chunks
    result = manager.collection.get(include=["metadatas", "documents"])
    
    if not result or not result.get("ids"):
        print("Error: ChromaDB collection is empty.")
        return
        
    ids = result["ids"]
    metadatas = result["metadatas"]
    documents = result["documents"]
    
    total_chunks = len(ids)
    missing_pages = 0
    missing_sections = 0
    empty_chunks = 0
    metadata_issues = 0
    
    doc_chunk_counts = {}
    
    for i in range(total_chunks):
        doc = documents[i]
        meta = metadatas[i]
        
        if not doc or not doc.strip():
            empty_chunks += 1
            
        # Check page
        if meta.get("page") is None:
            missing_pages += 1
            
        # Check section
        if not meta.get("section"):
            missing_sections += 1
            
        # Check source/doc
        source = meta.get("source", "unknown")
        doc_chunk_counts[source] = doc_chunk_counts.get(source, 0) + 1
        
        # Check metadata consistency
        if "id" not in meta or "documentId" not in meta:
            metadata_issues += 1
            
    print(f"=====================================")
    print(f"Hierarchical Chunking Validation Report")
    print(f"=====================================")
    print(f"Total Chunks Checked: {total_chunks}")
    print(f"Chunks Missing Page: {missing_pages}")
    print(f"Chunks Missing Section: {missing_sections}")
    print(f"Empty Chunks: {empty_chunks}")
    print(f"Metadata Integrity Issues: {metadata_issues}")
    print(f"\nChunks per Document:")
    for source, count in doc_chunk_counts.items():
        print(f"  - {source}: {count} chunks")
        
    print(f"=====================================")
    
    if missing_pages == 0 and empty_chunks == 0 and metadata_issues == 0:
        print("✅ Validation PASSED")
        sys.exit(0)
    else:
        print("❌ Validation FAILED")
        sys.exit(1)

if __name__ == "__main__":
    validate_hierarchy()
