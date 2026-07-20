import requests
from bs4 import BeautifulSoup
import logging
from typing import List, Dict, Any
from urllib.parse import urlparse
from .base_connector import BaseConnector

logger = logging.getLogger(__name__)

class ICARConnector(BaseConnector):
    def __init__(self, config: Dict[str, Any]):
        super().__init__("ICAR", config)
        self.seed_urls = [
            "https://icar.org.in/content/publications",
            # Add specific research portals or repository URLs here
        ]
        
    def discover_documents(self) -> List[Dict[str, Any]]:
        documents = []
        visited = set()
        
        for seed in self.seed_urls:
            try:
                response = requests.get(seed, timeout=15)
                response.raise_for_status()
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Source-specific logic: ICAR publications often appear in specific tables or lists
                # For Phase 1 scaffolding, we extract all PDF links.
                for link in soup.find_all('a', href=True):
                    href = link['href']
                    if href.lower().endswith('.pdf') or href.lower().endswith('.docx'):
                        doc_url = self._normalize_url(seed, href)
                        
                        if doc_url in visited:
                            continue
                            
                        visited.add(doc_url)
                        
                        title = link.text.strip()
                        if not title:
                            title = href.split('/')[-1]
                            
                        documents.append({
                            "title": title,
                            "document_url": doc_url,
                            "source": self.source_name,
                            "category": "Research/Publication",
                            "language": "English",
                            "published_year": "Unknown"
                        })
            except Exception as e:
                logger.error(f"ICARConnector failed to scrape {seed}: {e}")
                
        return documents
