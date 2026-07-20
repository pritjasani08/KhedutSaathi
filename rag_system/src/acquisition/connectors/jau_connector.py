import requests
from bs4 import BeautifulSoup
import logging
from typing import List, Dict, Any
from .base_connector import BaseConnector

logger = logging.getLogger(__name__)

class JAUConnector(BaseConnector):
    def __init__(self, config: Dict[str, Any]):
        super().__init__("JAU", config)
        self.seed_urls = [
            "http://www.jau.in/index.php/farmers-corner",
        ]
        
    def discover_documents(self) -> List[Dict[str, Any]]:
        documents = []
        visited = set()
        for seed in self.seed_urls:
            try:
                response = requests.get(seed, timeout=15)
                response.raise_for_status()
                soup = BeautifulSoup(response.text, 'html.parser')
                
                for link in soup.find_all('a', href=True):
                    href = link['href']
                    if href.lower().endswith('.pdf'):
                        doc_url = self._normalize_url(seed, href)
                        if doc_url in visited: continue
                        visited.add(doc_url)
                        
                        title = link.text.strip() or href.split('/')[-1]
                        documents.append({
                            "title": title,
                            "document_url": doc_url,
                            "source": self.source_name,
                            "category": "University Publication",
                            "language": "Gujarati/English",
                            "published_year": "Unknown"
                        })
            except Exception as e:
                logger.error(f"JAUConnector failed to scrape {seed}: {e}")
        return documents
