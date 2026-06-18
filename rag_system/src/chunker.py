from typing import List, Dict
from langchain_text_splitters import RecursiveCharacterTextSplitter
from src.config import CHUNK_SIZE, CHUNK_OVERLAP

def chunk_documents(documents: List[Dict]) -> List[Dict]:
    """Chunks documents into smaller pieces using configured size and overlap."""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        separators=["\n\n", "\n", " ", ""]
    )
    
    chunked_docs = []
    for doc in documents:
        content = doc["content"]
        metadata = doc["metadata"]
        
        chunks = text_splitter.split_text(content)
        for i, chunk in enumerate(chunks):
            chunk_metadata = metadata.copy()
            chunk_metadata["chunk_index"] = i
            chunked_docs.append({
                "content": chunk,
                "metadata": chunk_metadata
            })
            
    return chunked_docs
