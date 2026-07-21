"""
Incremental Knowledge Ingestion Script
Usage:
  python ingest_knowledge.py         (Incremental update)
  python ingest_knowledge.py --full  (Full rebuild)
"""
import sys
import os
import argparse
import time
import logging

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

try:
    from rag_system.src.knowledge_engine.indexer import KnowledgeIndexer
    from rag_system.src.knowledge_engine.parser import DocumentParser
    from rag_system.src.knowledge_engine.chunker import HierarchicalChunker
except Exception as e:
    print(f"Failed to import RAG components: {e}")
    sys.exit(1)

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

DOCUMENTS_DIR = os.path.join(os.path.dirname(__file__), "..", "knowledge", "documents")
MANIFEST_PATH = os.path.join(os.path.dirname(__file__), "..", "knowledge", "manifest.json")

def main():
    parser = argparse.ArgumentParser(description="Ingest agricultural knowledge into ChromaDB.")
    parser.add_argument("--full", action="store_true", help="Perform a full rebuild of the index.")
    args = parser.parse_args()

    start_time = time.time()
    indexer = KnowledgeIndexer(MANIFEST_PATH)

    mode = "Incremental"
    if args.full or not indexer.check_environment_compatibility(force_full=args.full):
        logger.info("Environment incompatible or --full requested. Performing full rebuild.")
        indexer.clear_index()
        mode = "Full Rebuild"

    if not os.path.exists(DOCUMENTS_DIR):
        logger.error(f"Documents directory not found: {DOCUMENTS_DIR}")
        sys.exit(1)

    pdf_files = []
    for root, _, files in os.walk(DOCUMENTS_DIR):
        for f in files:
            if f.lower().endswith(".pdf"):
                pdf_files.append(os.path.join(root, f))
                
    current_files_set = set(pdf_files)
    
    # Identify deleted files (in manifest but not in file system)
    manifest_files_set = set(indexer.manifest.get("documents", {}).keys())
    deleted_files = manifest_files_set - current_files_set

    # Metrics
    scanned = len(pdf_files)
    new_count = 0
    modified_count = 0
    deleted_count = len(deleted_files)
    skipped_count = 0
    chunks_created = 0
    vectors_removed = 0
    vectors_inserted = 0

    # Process deletions
    for deleted_file in deleted_files:
        document_id = indexer.manifest["documents"][deleted_file].get("document_id") if isinstance(indexer.manifest["documents"][deleted_file], dict) else os.path.basename(deleted_file).replace(".pdf", "")
        # Assuming avg 100 vectors per document deleted for reporting if we don't know the exact count
        doc_entry = indexer.manifest["documents"].get(deleted_file)
        if isinstance(doc_entry, dict):
            vectors_removed += doc_entry.get("chunk_count", 0)
            
        indexer.remove_document(deleted_file, document_id)

    chunker = HierarchicalChunker()

    # Process additions / modifications
    for pdf_path in pdf_files:
        if indexer.should_process(pdf_path):
            is_new = pdf_path not in manifest_files_set
            if is_new:
                new_count += 1
            else:
                modified_count += 1
                
                # Count removed vectors from old version
                doc_entry = indexer.manifest["documents"].get(pdf_path)
                if isinstance(doc_entry, dict):
                    vectors_removed += doc_entry.get("chunk_count", 0)
                
            try:
                document_parser = DocumentParser(pdf_path)
                document = document_parser.parse()
                if not document:
                    logger.warning(f"Failed to parse {pdf_path}")
                    continue
                    
                chunks = chunker.chunk_document(document)
                if not chunks:
                    logger.warning(f"No chunks created for {pdf_path}")
                    continue
                    
                indexer.index_chunks(pdf_path, chunks)
                
                chunks_created += len(chunks)
                vectors_inserted += len(chunks)
                
            except Exception as e:
                logger.error(f"Error processing {pdf_path}: {e}")
        else:
            skipped_count += 1

    elapsed_time = time.time() - start_time

    # Output Summary exactly as requested
    print("\nKnowledge Scan")
    print("-" * 20)
    print(f"Documents scanned: {scanned}\n")
    print(f"New:\n{new_count}\n")
    print(f"Modified:\n{modified_count}\n")
    print(f"Deleted:\n{deleted_count}\n")
    print(f"Skipped:\n{skipped_count}\n")
    print(f"Chunks created:\n{chunks_created}\n")
    print(f"Embeddings generated:\n{vectors_inserted}\n") # vectors inserted = embeddings generated
    print(f"Vectors removed:\n{vectors_removed}\n")
    print(f"Vectors inserted:\n{vectors_inserted}\n")
    print(f"Elapsed time:\n{int(elapsed_time)} seconds\n")
    print(f"Mode:\n{mode}\n")

if __name__ == "__main__":
    main()
