import yaml
import os
import logging

logger = logging.getLogger(__name__)

CONFIG_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../rag_system/knowledge/config.yaml'))

class AcquisitionConfig:
    def __init__(self, config_path: str = CONFIG_PATH):
        self.config_path = os.path.abspath(config_path)
        self.config = self._load_config()

    def _load_config(self) -> dict:
        if not os.path.exists(self.config_path):
            logger.warning(f"Config file not found at {self.config_path}. Using default empty configuration.")
            return {"sources": {}}
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                return yaml.safe_load(f) or {"sources": {}}
        except Exception as e:
            logger.error(f"Error loading config {self.config_path}: {e}")
            return {"sources": {}}

    def get_source_config(self, source_name: str) -> dict:
        """Returns the configuration for a specific source."""
        return self.config.get('sources', {}).get(source_name, {})

    def should_include(self, source_name: str, text: str) -> bool:
        """
        Returns True if the text passes the source's include/exclude filter rules.
        If no rules are defined, it defaults to True.
        """
        source_config = self.get_source_config(source_name)
        if not source_config:
            return True
            
        include_keywords = source_config.get('include_keywords', [])
        exclude_keywords = source_config.get('exclude_keywords', [])
        
        text_lower = text.lower()
        
        # Check exclusion first
        if any(keyword.lower() in text_lower for keyword in exclude_keywords):
            return False
            
        # If there are inclusion rules, at least one must match
        if include_keywords:
            if not any(keyword.lower() in text_lower for keyword in include_keywords):
                return False
                
        return True
