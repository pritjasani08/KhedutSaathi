from abc import ABC, abstractmethod
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

class BaseConnector(ABC):
    """
    Abstract base class for all source-specific knowledge connectors.
    """
    def __init__(self, source_name: str, config: Dict[str, Any]):
        self.source_name = source_name
        self.config = config
        
    @abstractmethod
    def discover_documents(self) -> List[Dict[str, Any]]:
        """
        Discovers documents from the source website.
        Must return a list of dictionaries with at least:
        - title
        - document_url (PDF, HTML, DOCX, etc.)
        - source
        - category (optional)
        - language (optional)
        - published_year (optional)
        """
        pass

    def _normalize_url(self, base_url: str, url: str) -> str:
        if not url:
            return ""
        if url.startswith("http"):
            return url
        from urllib.parse import urljoin
        return urljoin(base_url, url)
