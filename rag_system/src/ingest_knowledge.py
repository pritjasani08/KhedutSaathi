import os
import logging
import sys
import json

# Ensure project root is in python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from rag_system.src.knowledge_engine.parser import DocumentParser
from rag_system.src.knowledge_engine.chunker import HierarchicalChunker
from rag_system.src.knowledge_engine.indexer import KnowledgeIndexer

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

KNOWLEDGE_DOCS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../rag_system/knowledge/documents'))
MANIFEST_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../rag_system/knowledge/manifest.json'))
METADATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../rag_system/knowledge/metadata'))

def build_metadata_map():
    mapping = {}
    if not os.path.exists(METADATA_DIR):
        return mapping
    for meta_file in os.listdir(METADATA_DIR):
        if not meta_file.endswith(".json"):
            continue
        try:
            with open(os.path.join(METADATA_DIR, meta_file), 'r', encoding='utf-8') as f:
                data = json.load(f)
                if data.get("localPath"):
                    mapping[data["localPath"]] = data
        except Exception as e:
            logger.warning(f"Failed to read metadata {meta_file}: {e}")
    return mapping

def ingest_all():
    logger.info("Starting Knowledge Ingestion Pipeline...")
    
    if not os.path.exists(KNOWLEDGE_DOCS_DIR):
        logger.warning(f"Knowledge documents directory not found: {KNOWLEDGE_DOCS_DIR}")
        return
        
    indexer = KnowledgeIndexer(MANIFEST_PATH)
    indexer.integrity_check()
    
    chunker = HierarchicalChunker(max_chunk_size=1000)
    
    metadata_map = build_metadata_map()
    
    total_processed = 0
    total_skipped = 0
    
    for root, dirs, files in os.walk(KNOWLEDGE_DOCS_DIR):
        for file in files:
            if not file.lower().endswith(".pdf"):
                continue
                
            file_path = os.path.join(root, file)
            
            if not indexer.should_process(file_path):
                logger.info(f"Skipping unchanged document: {file}")
                total_skipped += 1
                continue
                
            logger.info(f"Processing new/modified document: {file}")
            try:
                doc_structure = None
                structure_file = file_path + ".structure.json"
                if os.path.exists(structure_file):
                    logger.info(f"Reusing existing parsed structure from {structure_file}")
                    try:
                        with open(structure_file, 'r', encoding='utf-8') as f:
                            doc_structure = json.load(f)
                    except Exception as e:
                        logger.warning(f"Failed to load cached structure for {file_path}, falling back to parser: {e}")
                        doc_structure = None

                if doc_structure is None:
                    # Parse PDF
                    parser = DocumentParser(file_path)
                    doc_structure = parser.parse()
                
                # Get metadata
                doc_metadata = metadata_map.get(file_path, {})

                # Semantic Chunking
                chunks = chunker.chunk_document(doc_structure, doc_metadata)
                logger.info(f"Generated {len(chunks)} chunks for {file}")
                
                # Index & Embed
                indexer.index_chunks(file_path, chunks, doc_metadata)
                
                total_processed += 1
                
            except Exception as e:
                logger.error(f"Error processing {file_path}: {e}")
                
    logger.info(f"Knowledge Ingestion Complete. Processed: {total_processed}, Skipped: {total_skipped}")

if __name__ == "__main__":
    ingest_all()
