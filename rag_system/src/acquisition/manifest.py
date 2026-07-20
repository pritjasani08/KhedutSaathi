import json
import os
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

MANIFEST_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../rag_system/knowledge/manifests/acquisition_manifest.json'))

class AcquisitionManifest:
    def __init__(self, manifest_path: str = MANIFEST_PATH):
        self.manifest_path = manifest_path
        self._ensure_dir()
        self.data = self._load_manifest()

    def _ensure_dir(self):
        os.makedirs(os.path.dirname(self.manifest_path), exist_ok=True)

    def _load_manifest(self) -> Dict[str, Any]:
        if os.path.exists(self.manifest_path):
            try:
                with open(self.manifest_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Error loading acquisition manifest: {e}")
        return {"urls": {}, "files": {}}

    def _save(self):
        try:
            with open(self.manifest_path, 'w', encoding='utf-8') as f:
                json.dump(self.data, f, indent=4)
        except Exception as e:
            logger.error(f"Error saving acquisition manifest: {e}")

    def is_url_downloaded(self, url: str) -> bool:
        """Checks if a URL has already been processed successfully."""
        return url in self.data.get("urls", {})

    def mark_url_downloaded(self, url: str, status: str = "success"):
        if "urls" not in self.data:
            self.data["urls"] = {}
        self.data["urls"][url] = status
        self._save()

    def is_file_hash_known(self, file_hash: str) -> bool:
        """Checks if a file with this hash has already been processed."""
        return file_hash in self.data.get("files", {})

    def record_file_hash(self, file_hash: str, file_path: str):
        if "files" not in self.data:
            self.data["files"] = {}
        self.data["files"][file_hash] = file_path
        self._save()
