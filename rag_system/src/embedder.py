import logging
from sentence_transformers import SentenceTransformer
from rag_system.src.config import EMBEDDING_MODEL_NAME

logger = logging.getLogger(__name__)

_model = None

class CustomEmbedder:
    def __init__(self):
        global _model

        if _model is None:
            logger.info(f"Loading embedding model: {EMBEDDING_MODEL_NAME}")

            _model = SentenceTransformer(
                EMBEDDING_MODEL_NAME,
                device="cuda"
            )

        self.model = _model

    def embed_documents(self, texts):
        embeddings = self.model.encode(
            texts,
            normalize_embeddings=True,
            convert_to_numpy=True
        )
        return embeddings.tolist()

    def embed_query(self, text):
        embedding = self.model.encode(
            text,
            normalize_embeddings=True,
            convert_to_numpy=True
        )
        return embedding.tolist()

def get_embedder():
    return CustomEmbedder()