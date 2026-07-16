from typing import Dict, Any, Optional
import time

class CacheService:
    def __init__(self, ttl_seconds: int = 3600):
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.ttl = ttl_seconds
        self.metrics = {"hits": 0, "misses": 0, "expirations": 0}

    def _generate_key(self, farmer_id: str) -> str:
        return f"briefing_{farmer_id}"

    def get(self, farmer_id: str) -> Optional[Dict[str, Any]]:
        key = self._generate_key(farmer_id)
        if key in self.cache:
            entry = self.cache[key]
            if time.time() - entry["timestamp"] < self.ttl:
                self.metrics["hits"] += 1
                return entry["data"]
            else:
                self.metrics["expirations"] += 1
                del self.cache[key]
        self.metrics["misses"] += 1
        return None

    def set(self, farmer_id: str, data: Dict[str, Any]):
        key = self._generate_key(farmer_id)
        self.cache[key] = {
            "timestamp": time.time(),
            "data": data
        }
        
    def get_stats(self) -> Dict[str, Any]:
        return {
            "size": len(self.cache),
            "hits": self.metrics["hits"],
            "misses": self.metrics["misses"],
            "expirations": self.metrics["expirations"]
        }

# Global singleton
cache_service = CacheService()
