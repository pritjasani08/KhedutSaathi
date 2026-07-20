import json
import os
import uuid
import datetime
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

METADATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../rag_system/knowledge/metadata'))

class MetadataGenerator:
    def __init__(self, metadata_dir: str = METADATA_DIR):
        self.metadata_dir = metadata_dir
        os.makedirs(self.metadata_dir, exist_ok=True)

    def generate(self, document_info: Dict[str, Any], file_hash: str, local_path: str) -> str:
        """
        Generates and saves the structured metadata for a downloaded document.
        Returns the path to the saved metadata file.
        """
        doc_id = str(uuid.uuid4())
        
        title = document_info.get("title", os.path.basename(local_path))
        
        # Improved year extraction
        import re
        published_year = document_info.get("published_year")
        if not published_year or published_year == "Unknown":
            # Try from title or local_path
            year_match = re.search(r'\b(19\d{2}|20\d{2})\b', title)
            if not year_match:
                year_match = re.search(r'\b(19\d{2}|20\d{2})\b', local_path)
            
            if year_match:
                published_year = year_match.group(1)
            else:
                published_year = "Unknown"
                
        # Improved language extraction (List format)
        lang_raw = document_info.get("language", "English")
        if isinstance(lang_raw, str):
            # Split by common delimiters if it's a string like "Tamil/English"
            languages = [l.strip() for l in re.split(r'[/,;]', lang_raw) if l.strip()]
        elif isinstance(lang_raw, list):
            languages = lang_raw
        else:
            languages = ["English"]
            
        document_type = document_info.get("document_type")
        if not document_type:
            # Fallback to category if document_type wasn't provided directly
            document_type = document_info.get("category", "Uncategorized")
            
        metadata = {
            "id": doc_id,
            "title": title,
            "source": document_info.get("source", "Unknown"),
            "downloadDate": datetime.datetime.now().isoformat(),
            "publishedYear": published_year,
            "languages": languages,
            "status": "pending",
            "fileHash": file_hash,
            "localPath": local_path,
            "approved": False,
            "document_type": document_type,
            "crop": document_info.get("crop", None),
            "topic": document_info.get("topic", None),
            "growth_stage": document_info.get("growth_stage", None),
            "season": document_info.get("season", None),
            "region": document_info.get("region", None),
            "keywords": document_info.get("keywords", [])
        }
        
        file_name = f"{metadata['source']}_{doc_id}.json".replace(" ", "_")
        file_path = os.path.join(self.metadata_dir, file_name)
        
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(metadata, f, indent=4)
            logger.info(f"Generated metadata for {metadata['title']} at {file_path}")
            return file_path
        except Exception as e:
            logger.error(f"Failed to save metadata for {local_path}: {e}")
            return ""
