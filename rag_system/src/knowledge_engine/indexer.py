import json
import os
import hashlib
import logging
import time
from typing import List, Dict, Any

from rag_system.src.chroma_manager import ChromaDBManager
from rag_system.src.config import EMBEDDING_MODEL_NAME

logger = logging.getLogger(__name__)

INDEX_VERSION = "1.1"
CHUNK_VERSION = "2.1"

class KnowledgeIndexer:
    def __init__(self, manifest_path: str):
        self.manifest_path = manifest_path
        self.chroma_manager = ChromaDBManager()
        self.manifest = self._load_manifest()
        
    def _load_manifest(self) -> Dict[str, Any]:
        if os.path.exists(self.manifest_path):
            try:
                with open(self.manifest_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    if "documents" in data:
                        return data
                    else:
                        return {"_metadata": {}, "documents": {}}
            except Exception as e:
                logger.error(f"Error loading manifest: {e}")
        return {"_metadata": {}, "documents": {}}
        
    def _save_manifest(self):
        self.manifest["_metadata"] = {
            "chunk_version": CHUNK_VERSION,
            "embedding_model": EMBEDDING_MODEL_NAME,
            "index_version": INDEX_VERSION,
            "ingestion_timestamp": str(time.time())
        }
        with open(self.manifest_path, 'w', encoding='utf-8') as f:
            json.dump(self.manifest, f, indent=4)
            
    def _calculate_sha256(self, file_path: str) -> str:
        hasher = hashlib.sha256()
        with open(file_path, 'rb') as f:
            buf = f.read()
            hasher.update(buf)
        return hasher.hexdigest()

    def check_environment_compatibility(self, force_full: bool = False) -> bool:
        """
        Returns True if environment is compatible for incremental updates.
        Returns False if a full rebuild is required (e.g. model changed).
        """
        if force_full:
            return False
            
        meta = self.manifest.get("_metadata", {})
        if not meta:
            return False
            
        if meta.get("embedding_model") != EMBEDDING_MODEL_NAME:
            logger.warning(f"Embedding model changed from {meta.get('embedding_model')} to {EMBEDDING_MODEL_NAME}. Full rebuild required.")
            return False
            
        if meta.get("chunk_version") != CHUNK_VERSION:
            logger.warning(f"Chunk version changed from {meta.get('chunk_version')} to {CHUNK_VERSION}. Full rebuild required.")
            return False
            
        if meta.get("index_version") != INDEX_VERSION:
            logger.warning(f"Index version changed from {meta.get('index_version')} to {INDEX_VERSION}. Full rebuild required.")
            return False
            
        return True
        
    def clear_index(self):
        """Clears the entire index for a full rebuild."""
        logger.info("Clearing ChromaDB collection and manifest for full rebuild...")
        try:
            self.chroma_manager.client.delete_collection(self.chroma_manager.collection.name)
            self.chroma_manager = ChromaDBManager() # Re-init
            self.manifest = {"_metadata": {}, "documents": {}}
            self._save_manifest()
        except Exception as e:
            logger.error(f"Failed to clear index: {e}")

    def remove_document(self, file_path: str, document_id: str):
        """Removes a document and its vectors from the index."""
        logger.info(f"Removing vectors for document: {document_id}")
        try:
            self.chroma_manager.collection.delete(where={"source": document_id})
            if file_path in self.manifest["documents"]:
                del self.manifest["documents"][file_path]
                self._save_manifest()
        except Exception as e:
            logger.error(f"Failed to remove document {document_id}: {e}")

    def should_process(self, file_path: str) -> bool:
        """Returns True if the file is new or modified."""
        if not os.path.exists(file_path):
            return False
            
        current_hash = self._calculate_sha256(file_path)
        doc_entry = self.manifest["documents"].get(file_path)
        
        # Support legacy manifest format (just a string hash)
        if isinstance(doc_entry, str):
            # Treat as modified to upgrade to new rich schema
            return True
            
        if not doc_entry:
            return True
            
        last_hash = doc_entry.get("sha256")
        return current_hash != last_hash
        
    def index_chunks(self, file_path: str, chunks: List[Dict[str, Any]], doc_metadata: Dict[str, Any] = None):
        """
        Indexes chunks into ChromaDB and updates the manifest.
        """
        if not chunks:
            return
            
        document_id = chunks[0]["documentId"]
        file_hash = self._calculate_sha256(file_path)
        
        # Remove existing chunks for this document if this is an update
        self.chroma_manager.collection.delete(where={"source": document_id})
        
        chroma_chunks = []
        for i, chunk in enumerate(chunks):
            metadata = {
                "source": document_id,
                "chunk_index": i,
                "page": chunk["page"],
                "section": chunk["section"],
                "subSection": chunk["subSection"],
                "title": chunk["title"],
                "chunk_id": chunk["id"],
                "document_hash": file_hash,
                "chunk_version": CHUNK_VERSION,
                "embedding_model": EMBEDDING_MODEL_NAME,
                "index_version": INDEX_VERSION,
                "ingestion_timestamp": str(time.time())
            }
            
            for key in ["crop", "topic", "growth_stage", "season", "region", "document_type", "institution", "state", "soil_type", "irrigation_method"]:
                val = chunk.get(key)
                if val is not None:
                    metadata[key] = val
                    
            crops = chunk.get("crops")
            if crops and isinstance(crops, list):
                metadata["crops"] = ", ".join(crops)
                    
            languages = chunk.get("languages")
            if languages:
                metadata["languages"] = ", ".join(languages)
                    
            chroma_chunks.append({
                "content": chunk["text"],
                "metadata": metadata
            })
            
        logger.info(f"Indexing {len(chroma_chunks)} chunks for {file_path}")
        self.chroma_manager.insert_chunks(chroma_chunks)
        
        self.manifest["documents"][file_path] = {
            "document_id": document_id,
            "file_name": os.path.basename(file_path),
            "sha256": file_hash,
            "chunk_count": len(chunks),
            "embedding_model": EMBEDDING_MODEL_NAME,
            "chunk_version": CHUNK_VERSION,
            "index_version": INDEX_VERSION,
            "last_indexed": str(time.time())
        }
        self._save_manifest()
        logger.info(f"Updated manifest for {file_path}")
