import os
from pathlib import Path
import logging
from dotenv import load_dotenv

# Initialize startup logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BASE_DIR.parent

# Explicitly load .env from project root directory
env_path = PROJECT_ROOT / ".env"
logger.info(f"Attempting to load environment variables from: {env_path}")

if load_dotenv(dotenv_path=env_path):
    logger.info(f"Successfully loaded .env from {env_path}")
else:
    logger.error(f"Failed to load .env from {env_path} or file is empty/missing.")

# Data Paths
DATA_DIR = BASE_DIR / "data"
PDF_DIR = DATA_DIR / "pdfs"
URLS_FILE = DATA_DIR / "urls.txt"
HTML_CACHE_DIR = DATA_DIR / "html_cache"

# Environment Variables
# Multiple keys might be provided (GEMINI_API_KEY_1, etc.)
has_gemini_key = any(k.startswith("GEMINI_API_KEY") and v.strip() for k, v in os.environ.items())

# Startup Validation
if not has_gemini_key:
    raise ValueError("Missing GEMINI_API_KEY in project root .env")

GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
EMBEDDING_MODEL_NAME = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
EMBEDDING_DEVICE = os.getenv("EMBEDDING_DEVICE", "auto")
EMBEDDING_BATCH_SIZE = os.getenv("EMBEDDING_BATCH_SIZE", 32)

# Hybrid Retrieval Settings
ENABLE_RERANKER = os.getenv("ENABLE_RERANKER", "true").lower() == "true"
RERANKER_MODEL_NAME = "cross-encoder/ms-marco-MiniLM-L-6-v2"
HYBRID_WEIGHTS = {
    "semantic": 0.40,
    "crop": 0.25,
    "region": 0.20,
    "season": 0.15
}

# Supported extensions
SUPPORTED_EXTENSIONS = [".pdf", ".txt", ".md", ".json", ".csv"]

chroma_path_env = os.getenv("CHROMA_DB_PATH", "rag_system/vector_db")
CHROMA_DB_PATH = PROJECT_ROOT / chroma_path_env if not Path(chroma_path_env).is_absolute() else Path(chroma_path_env)
COLLECTION_NAME = "khedut_saathi_rag"

CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "1000"))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "200"))
TOP_K_RETRIEVAL = int(os.getenv("TOP_K", "5"))
RAG_CONFIDENCE_THRESHOLD = float(os.getenv("RAG_CONFIDENCE_THRESHOLD", "0.40"))
DUPLICATE_SIMILARITY = float(os.getenv("DUPLICATE_SIMILARITY", "0.90"))

