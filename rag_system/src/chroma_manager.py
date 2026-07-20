import logging
import chromadb
import time
import json
import os
from pathlib import Path
from typing import List, Dict

from rag_system.src.config import CHROMA_DB_PATH, COLLECTION_NAME, EMBEDDING_MODEL_NAME, EMBEDDING_BATCH_SIZE
from rag_system.src.embedder import get_embedder

logger = logging.getLogger(__name__)

class ChromaDBManager:
    def __init__(self):
        logger.info(f"Connecting to ChromaDB at {CHROMA_DB_PATH}")

        self.client = chromadb.PersistentClient(
            path=str(CHROMA_DB_PATH)
        )
        
        self.embedder = get_embedder()
        self._check_and_update_schema()

        self.collection = self.client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"}
        )

    def _check_and_update_schema(self):
        metadata_path = os.path.join(CHROMA_DB_PATH, "index_metadata.json")
        rebuild_needed = False
        
        try:
            dimension = self.embedder.model.get_sentence_embedding_dimension()
        except Exception as e:
            logger.warning(f"Failed to get dynamic embedding dimension, falling back to 1024: {e}")
            dimension = 1024
            
        current_schema = {
            "embedding_model": EMBEDDING_MODEL_NAME,
            "embedding_dimension": dimension,
            "chunker_version": "2.0",
            "metadata_schema_version": "2",
            "knowledge_engine_version": "2.0"
        }
        
        if os.path.exists(metadata_path):
            try:
                with open(metadata_path, 'r', encoding='utf-8') as f:
                    existing_schema = json.load(f)
                    
                for key, expected_value in current_schema.items():
                    if existing_schema.get(key) != expected_value:
                        logger.warning(f"Schema mismatch detected: {key} changed from {existing_schema.get(key)} to {expected_value}")
                        rebuild_needed = True
                        break
            except Exception as e:
                logger.error(f"Failed to read index_metadata.json: {e}")
                rebuild_needed = True
        else:
            logger.info("No index_metadata.json found. Assuming rebuild is needed or fresh installation.")
            rebuild_needed = True
            
        if rebuild_needed:
            logger.warning("Performing a full clean rebuild of the Chroma collection due to schema changes or missing metadata...")
            try:
                self.client.delete_collection(name=COLLECTION_NAME)
                logger.info("Successfully deleted old collection.")
            except Exception:
                pass # Collection might not exist
            
            # Wipe manifest as well so everything re-indexes
            manifest_path = os.path.abspath(os.path.join(CHROMA_DB_PATH, '../knowledge/manifest.json'))
            if os.path.exists(manifest_path):
                try:
                    os.remove(manifest_path)
                    logger.info("Deleted manifest.json to force re-indexing of all documents.")
                except Exception as e:
                    logger.error(f"Failed to delete manifest.json: {e}")
            
            os.makedirs(CHROMA_DB_PATH, exist_ok=True)
            with open(metadata_path, 'w', encoding='utf-8') as f:
                json.dump(current_schema, f, indent=4)
            logger.info(f"Saved new index_metadata.json to {metadata_path}")
        else:
            logger.info("ChromaDB schema is up-to-date.")

    def insert_chunks(self, chunks: List[Dict]):
        """Embeds and inserts text chunks into ChromaDB in batches."""
        if not chunks:
            logger.warning("No chunks to insert.")
            return

        logger.info(f"Preparing to insert {len(chunks)} chunks into ChromaDB...")

        texts = [chunk["content"] for chunk in chunks]
        metadatas = [chunk["metadata"] for chunk in chunks]
        ids = [
            f"{m.get('source', 'unknown')}_{m.get('chunk_index', 0)}_{i}"
            for i, m in enumerate(metadatas)
        ]

        if EMBEDDING_BATCH_SIZE and str(EMBEDDING_BATCH_SIZE).isdigit():
            batch_size = int(EMBEDDING_BATCH_SIZE)
        else:
            # Default to 32 if GPU, else 100
            import torch
            batch_size = 32 if torch.cuda.is_available() else 100

        total_batches = (len(texts) + batch_size - 1) // batch_size
        total_time = 0

        for batch_num, start_idx in enumerate(range(0, len(texts), batch_size), start=1):
            end_idx = min(start_idx + batch_size, len(texts))
            
            batch_texts = texts[start_idx:end_idx]
            batch_metadatas = metadatas[start_idx:end_idx]
            batch_ids = ids[start_idx:end_idx]

            logger.info(f"Embedding batch {batch_num}/{total_batches} ({len(batch_texts)} chunks)")

            start_time = time.time()
            batch_embeddings = self.embedder.embed_documents(batch_texts)
            embed_time = time.time() - start_time
            total_time += embed_time

            self.collection.upsert(
                ids=batch_ids,
                embeddings=batch_embeddings,
                metadatas=batch_metadatas,
                documents=batch_texts
            )

            logger.info(f"Inserted batch {batch_num}/{total_batches} in {embed_time:.2f}s")
            
            if hasattr(self.embedder, 'cleanup_memory'):
                self.embedder.cleanup_memory()

        logger.info(f"Successfully inserted {len(texts)} chunks into ChromaDB. Total embedding time: {total_time:.2f}s.")