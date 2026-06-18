import logging
import chromadb
from typing import List, Dict

from src.config import CHROMA_DB_PATH, COLLECTION_NAME
from src.embedder import get_embedder

logger = logging.getLogger(__name__)


class ChromaDBManager:
    def __init__(self):
        logger.info(f"Connecting to ChromaDB at {CHROMA_DB_PATH}")

        self.client = chromadb.PersistentClient(
            path=str(CHROMA_DB_PATH)
        )

        self.embedder = get_embedder()

        self.collection = self.client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"}
        )

    def insert_chunks(self, chunks: List[Dict]):
        """Embeds and inserts text chunks into ChromaDB in batches."""

        if not chunks:
            logger.warning("No chunks to insert.")
            return

        logger.info(
            f"Preparing to insert {len(chunks)} chunks into ChromaDB..."
        )

        texts = [chunk["content"] for chunk in chunks]
        metadatas = [chunk["metadata"] for chunk in chunks]

        ids = [
            f"{m.get('source', 'unknown')}_{m.get('chunk_index', 0)}_{i}"
            for i, m in enumerate(metadatas)
        ]

        batch_size = 100
        total_batches = (len(texts) + batch_size - 1) // batch_size

        for batch_num, start_idx in enumerate(
            range(0, len(texts), batch_size),
            start=1
        ):
            end_idx = min(start_idx + batch_size, len(texts))

            batch_texts = texts[start_idx:end_idx]
            batch_metadatas = metadatas[start_idx:end_idx]
            batch_ids = ids[start_idx:end_idx]

            logger.info(
                f"Embedding batch {batch_num}/{total_batches}"
            )

            batch_embeddings = self.embedder.embed_documents(
                batch_texts
            )

            self.collection.upsert(
                ids=batch_ids,
                embeddings=batch_embeddings,
                metadatas=batch_metadatas,
                documents=batch_texts
            )

            logger.info(
                f"Inserted batch {batch_num}/{total_batches}"
            )

        logger.info(
            f"Successfully inserted {len(texts)} chunks into ChromaDB."
        )