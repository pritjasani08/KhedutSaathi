import logging
import requests
from bs4 import BeautifulSoup
from pathlib import Path
from typing import List, Dict
from rag_system.src.config import URLS_FILE, HTML_CACHE_DIR

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def load_urls() -> List[Dict]:
    """Reads URLs from urls.txt, downloads HTML, extracts text, and caches it."""
    documents = []
    urls_file = Path(URLS_FILE)
    cache_dir = Path(HTML_CACHE_DIR)
    
    if not cache_dir.exists():
        cache_dir.mkdir(parents=True, exist_ok=True)
        
    if not urls_file.exists():
        logger.warning(f"URLs file does not exist: {urls_file}")
        return documents

    with open(urls_file, "r", encoding="utf-8") as f:
        urls = [line.strip() for line in f.readlines() if line.strip() and not line.startswith("#")]

    for url in urls:
        try:
            logger.info(f"Fetching URL: {url}")
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, "html.parser")
            
            # Remove scripts and styles
            for script in soup(["script", "style"]):
                script.extract()
                
            text = soup.get_text(separator="\n")
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            clean_text = "\n".join(chunk for chunk in chunks if chunk)
            
            # Simple cache filename
            safe_name = "".join([c if c.isalnum() else "_" for c in url])
            cache_file = cache_dir / f"{safe_name}.txt"
            with open(cache_file, "w", encoding="utf-8") as f:
                f.write(clean_text)
                
            documents.append({
                "content": clean_text,
                "metadata": {"source": url, "type": "web"}
            })
            
        except Exception as e:
            logger.error(f"Error loading {url}: {e}")

    return documents
