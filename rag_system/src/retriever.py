import logging
from typing import List, Dict
from src.chroma_manager import ChromaDBManager
from src.config import TOP_K_RETRIEVAL

logger = logging.getLogger(__name__)

class Retriever:
    def __init__(self):
        self.db_manager = ChromaDBManager()

    def retrieve(self, query: str, top_k: int = TOP_K_RETRIEVAL) -> List[Dict]:
        """Retrieves top_k chunks relevant to the query and calculates similarity."""
        logger.info(f"Retrieving top {top_k} chunks for query: '{query}'")
        
        query_embedding = self.db_manager.embedder.embed_query(query)
        
        results = self.db_manager.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k
        )
        
        retrieved_chunks = []
        if results['documents'] and len(results['documents']) > 0:
            for i in range(len(results['documents'][0])):
                # ChromaDB uses cosine distance where distance = 1 - similarity
                distance = results['distances'][0][i] if results['distances'] else 0.0
                similarity = 1.0 - distance
                
                retrieved_chunks.append({
                    "content": results['documents'][0][i],
                    "metadata": results['metadatas'][0][i] if results['metadatas'] else {},
                    "distance": distance,
                    "similarity": similarity
                })
                
        return retrieved_chunks
