import logging
import torch
from sentence_transformers import SentenceTransformer
from rag_system.src.config import EMBEDDING_MODEL_NAME, EMBEDDING_DEVICE

logger = logging.getLogger(__name__)

_model = None
_device = None

class CustomEmbedder:
    def __init__(self):
        global _model, _device

        if _model is None:
            logger.info(f"Loading embedding model: {EMBEDDING_MODEL_NAME}")
            logger.info(f"Torch Version: {torch.__version__}")
            logger.info(f"CUDA Version: {torch.version.cuda if torch.version.cuda else 'N/A'}")
            logger.info(f"CUDA Available: {torch.cuda.is_available()}")

            selected_device = "cpu"
            if EMBEDDING_DEVICE.lower() == "auto":
                if torch.cuda.is_available():
                    selected_device = "cuda"
            elif EMBEDDING_DEVICE.lower() == "cuda":
                selected_device = "cuda"

            try:
                if selected_device == "cuda":
                    gpu_name = torch.cuda.get_device_name(0) if torch.cuda.is_available() else "Unknown GPU"
                    logger.info(f"GPU: {gpu_name}")
                
                _model = SentenceTransformer(EMBEDDING_MODEL_NAME, device=selected_device)
                _device = selected_device
                logger.info(f"Embedding Device: {_device}")
            except Exception as e:
                logger.error(f"Failed to initialize embedding model on {selected_device}: {e}")
                logger.warning("Falling back to CPU...")
                selected_device = "cpu"
                _model = SentenceTransformer(EMBEDDING_MODEL_NAME, device=selected_device)
                _device = selected_device
                logger.info(f"Embedding Device: {_device}")

        self.model = _model

    def cleanup_memory(self):
        if _device == "cuda" and torch.cuda.is_available():
            torch.cuda.empty_cache()

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