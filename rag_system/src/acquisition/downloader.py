import os
import requests
import hashlib
import tempfile
import logging
import time
from typing import Optional, Tuple
from rag_system.src.acquisition.manifest import AcquisitionManifest

logger = logging.getLogger(__name__)

class DocumentDownloader:
    def __init__(self, manifest: AcquisitionManifest, max_retries: int = 3, timeout: int = 30):
        self.manifest = manifest
        self.max_retries = max_retries
        self.timeout = timeout
        
    def _calculate_hash(self, file_path: str) -> str:
        hasher = hashlib.md5()
        with open(file_path, 'rb') as f:
            buf = f.read()
            hasher.update(buf)
        return hasher.hexdigest()

    def download(self, url: str) -> Tuple[Optional[str], Optional[str]]:
        """
        Downloads a document from a URL.
        Returns a tuple of (local_temp_path, file_hash) or (None, None) if failed/skipped.
        """
        if self.manifest.is_url_downloaded(url):
            logger.info(f"Skipping already downloaded URL: {url}")
            return None, None

        logger.info(f"Downloading: {url}")
        
        for attempt in range(1, self.max_retries + 1):
            try:
                response = requests.get(url, stream=True, timeout=self.timeout)
                response.raise_for_status()
                
                # Determine extension from url or headers
                ext = ".pdf"
                if url.lower().endswith(".pdf"):
                    ext = ".pdf"
                elif url.lower().endswith(".docx"):
                    ext = ".docx"
                elif url.lower().endswith(".html"):
                    ext = ".html"
                elif url.lower().endswith(".md"):
                    ext = ".md"
                    
                # Download to a temporary file first
                fd, temp_path = tempfile.mkstemp(suffix=ext)
                with os.fdopen(fd, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        if chunk:
                            f.write(chunk)
                            
                file_hash = self._calculate_hash(temp_path)
                
                if self.manifest.is_file_hash_known(file_hash):
                    logger.info(f"File already exists with hash {file_hash}, skipping. URL: {url}")
                    os.remove(temp_path)
                    self.manifest.mark_url_downloaded(url, "skipped_duplicate_hash")
                    return None, None
                    
                # Success
                return temp_path, file_hash

            except Exception as e:
                logger.warning(f"Attempt {attempt}/{self.max_retries} failed for {url}: {e}")
                if attempt == self.max_retries:
                    logger.error(f"Failed to download {url} after {self.max_retries} attempts.")
                    self.manifest.mark_url_downloaded(url, "failed")
                    return None, None
                time.sleep(2 ** attempt)  # Exponential backoff
                
        return None, None
