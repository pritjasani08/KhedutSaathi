import logging
from pathlib import Path
from typing import List, Dict
from langchain_community.document_loaders import PyPDFLoader
from rag_system.src.config import PDF_DIR

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def load_pdfs() -> List[Dict]:
    """Loads all PDFs from the data/pdfs directory."""
    documents = []
    pdf_dir = Path(PDF_DIR)
    
    if not pdf_dir.exists():
        logger.warning(f"PDF directory does not exist: {pdf_dir}")
        return documents

    for pdf_path in pdf_dir.glob("*.pdf"):
        try:
            logger.info(f"Loading PDF: {pdf_path.name}")
            loader = PyPDFLoader(str(pdf_path))
            docs = loader.load()
            for doc in docs:
                documents.append({
                    "content": doc.page_content,
                    "metadata": {"source": pdf_path.name, "page": doc.metadata.get("page", 0), "type": "pdf"}
                })
        except Exception as e:
            logger.error(f"Error loading {pdf_path.name}: {e}")

    return documents
