import json
import os
import hashlib
import logging
from typing import List, Dict, Any

from rag_system.src.chroma_manager import ChromaDBManager

logger = logging.getLogger(__name__)

class KnowledgeIndexer:
    def __init__(self, manifest_path: str):
        self.manifest_path = manifest_path
        self.chroma_manager = ChromaDBManager()
        self.manifest = self._load_manifest()
        
    def _load_manifest(self) -> Dict[str, str]:
        if os.path.exists(self.manifest_path):
            try:
                with open(self.manifest_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Error loading manifest: {e}")
        return {}
        
    def _save_manifest(self):
        with open(self.manifest_path, 'w', encoding='utf-8') as f:
            json.dump(self.manifest, f, indent=4)
            
    def _calculate_hash(self, file_path: str) -> str:
        hasher = hashlib.md5()
        with open(file_path, 'rb') as f:
            buf = f.read()
            hasher.update(buf)
        return hasher.hexdigest()

    def integrity_check(self):
        """
        Validates ChromaDB against the manifest.
        Deletes chunks for any documents in ChromaDB that aren't in the manifest (partial indexing).
        Removes manifest entries for documents that aren't in ChromaDB.
        """
        logger.info("Performing integrity check between ChromaDB and manifest...")
        
        try:
            # Note: chromadb collection.get() can return metadata. 
            # To get all unique sources, we might have to get all metadatas, but that might be large.
            # Using get(include=["metadatas"])
            all_docs = self.chroma_manager.collection.get(include=["metadatas"])
            metadatas = all_docs.get("metadatas", [])
            
            chroma_sources = set()
            for meta in metadatas:
                if meta and "source" in meta:
                    chroma_sources.add(meta["source"])
                    
            manifest_sources = set()
            for path in list(self.manifest.keys()):
                source = os.path.basename(path)
                # some chunks store source as just filename, or documentId.
                # our ingestion uses documentId (the filename without extension, or the URL).
                # Actually, in ingest_knowledge, we pass file_path to should_process, and documentId to index_chunks.
                # documentId is usually the filename. Let's just track file paths.
                
                # We'll just map file_path in manifest to its base name, which is documentId.
                manifest_sources.add(path)
                
            # Actually, `chunk["documentId"]` is often the filename without .pdf, or just filename.
            # Let's clean up partial documents based on `source`.
            for source in chroma_sources:
                # Find if any file in manifest matches this source
                # The manifest keys are full paths. The source in chroma is `documentId`.
                found = any(source in os.path.basename(p) for p in self.manifest.keys())
                if not found:
                    logger.warning(f"Found partial/inconsistent document in ChromaDB not in manifest: {source}")
                    logger.info(f"Deleting chunks for {source} to allow clean re-indexing.")
                    self.chroma_manager.collection.delete(where={"source": source})
                    
            # Check for manifest entries that are missing in ChromaDB
            for path in list(self.manifest.keys()):
                base_name = os.path.basename(path)
                # Check if base_name or similar is in chroma_sources
                found_in_chroma = any(base_name in s or s in base_name for s in chroma_sources)
                if not found_in_chroma and len(chroma_sources) > 0:
                    logger.warning(f"Manifest claims {path} is indexed, but no chunks found in ChromaDB.")
                    logger.info("Removing from manifest to force re-indexing.")
                    del self.manifest[path]
                    
            self._save_manifest()
            logger.info("Integrity check complete.")
        except Exception as e:
            logger.error(f"Integrity check failed: {e}")

    def should_process(self, file_path: str) -> bool:
        """Returns True if the file is new or modified."""
        if not os.path.exists(file_path):
            return False
        current_hash = self._calculate_hash(file_path)
        last_hash = self.manifest.get(file_path)
        return current_hash != last_hash
        
    def index_chunks(self, file_path: str, chunks: List[Dict[str, Any]], doc_metadata: Dict[str, Any] = None):
        """
        Indexes chunks into ChromaDB and updates the manifest.
        """
        chroma_chunks = []
        for i, chunk in enumerate(chunks):
            metadata = {
                "source": chunk["documentId"],
                "chunk_index": i,
                "page": chunk["page"],
                "section": chunk["section"],
                "subSection": chunk["subSection"],
                "title": chunk["title"],
                "chunk_id": chunk["id"]
            }
            
            for key in ["crop", "topic", "growth_stage", "season", "region", "document_type"]:
                val = chunk.get(key)
                if val is not None:
                    metadata[key] = val
                    
            languages = chunk.get("languages")
            if languages:
                metadata["languages"] = ", ".join(languages)
                    
            chroma_chunks.append({
                "content": chunk["text"],
                "metadata": metadata
            })
            
        logger.info(f"Indexing {len(chroma_chunks)} chunks for {file_path}")
        self.chroma_manager.insert_chunks(chroma_chunks)
        
        self.manifest[file_path] = self._calculate_hash(file_path)
        self._save_manifest()
        logger.info(f"Updated manifest for {file_path}")
