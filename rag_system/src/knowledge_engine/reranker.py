import logging
from typing import List, Dict, Any
from rag_system.src.config import ENABLE_RERANKER, RERANKER_MODEL_NAME

logger = logging.getLogger(__name__)

class KnowledgeReranker:
    def __init__(self):
        self.enabled = ENABLE_RERANKER
        self.model = None
        if self.enabled:
            try:
                from sentence_transformers import CrossEncoder
                logger.info(f"Loading Cross-Encoder model: {RERANKER_MODEL_NAME}")
                self.model = CrossEncoder(RERANKER_MODEL_NAME, max_length=512)
            except Exception as e:
                logger.error(f"Failed to load Cross-Encoder: {e}")
                self.enabled = False

    def rerank(self, query: str, chunks: List[Dict[str, Any]], top_k: int = 5) -> List[Dict[str, Any]]:
        if not self.enabled or not chunks:
            return chunks

        try:
            # Prepare pairs of (query, document)
            pairs = [[query, chunk["text"]] for chunk in chunks]
            
            # Predict scores
            scores = self.model.predict(pairs)
            
            # Update chunks with cross-encoder scores
            for i, chunk in enumerate(chunks):
                # The raw score can be logits, convert to a pseudo-probability or use directly for sorting
                # Sigmoid function for 0-1 range
                import math
                def sigmoid(x):
                    return 1 / (1 + math.exp(-x)) if x > -700 else 0
                
                chunk["rerank_score"] = sigmoid(scores[i])
            
            # Sort by rerank score descending
            chunks.sort(key=lambda x: x["rerank_score"], reverse=True)
            
            # Return all sorted chunks, deduplication layer will filter them
            return chunks
            
        except Exception as e:
            logger.error(f"Error during reranking: {e}")
            return chunks
