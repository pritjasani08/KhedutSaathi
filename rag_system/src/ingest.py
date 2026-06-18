import logging
from src.pdf_loader import load_pdfs
from src.web_loader import load_urls
from src.chunker import chunk_documents
from src.chroma_manager import ChromaDBManager
from src.config import HTML_CACHE_DIR, PDF_DIR

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
print("INGEST FILE LOADED")
def run_ingestion():
    print("RUN_INGESTION CALLED")
    """
    Main ingestion pipeline:
    1. Load PDFs and URLs
    2. Chunk text
    3. Embed and store in ChromaDB
    """
    logger.info("Starting ingestion process...")
    
    # Ensure directories exist
    HTML_CACHE_DIR.mkdir(parents=True, exist_ok=True)
    PDF_DIR.mkdir(parents=True, exist_ok=True)

    # 1. Load Documents
    logger.info("Loading PDFs...")
    pdf_docs = load_pdfs()
    
    logger.info("Loading web pages...")
    web_docs = load_urls()
    
    all_docs = pdf_docs + web_docs
    logger.info(f"Total documents loaded: {len(all_docs)}")
    
    if not all_docs:
        logger.warning("No documents found. Exiting ingestion.")
        return

    # 2. Chunking
    logger.info("Chunking documents...")
    chunks = chunk_documents(all_docs)
    logger.info(f"Total chunks created: {len(chunks)}")

    # 3. Vector DB Insertion
    logger.info("Initializing ChromaDB and embedding models...")
    db_manager = ChromaDBManager()
    db_manager.insert_chunks(chunks)
    
    logger.info("Ingestion completed successfully.")

if __name__ == "__main__":
    run_ingestion()
