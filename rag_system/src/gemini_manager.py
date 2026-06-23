import os
import logging
import google.generativeai as genai

logger = logging.getLogger(__name__)

class GeminiManager:
    _instance = None

    def __new__(cls, *args, **kwargs):
        # Singleton pattern to ensure we use the same manager and keep track of exhausted keys across the system
        if not cls._instance:
            cls._instance = super(GeminiManager, cls).__new__(cls, *args, **kwargs)
        return cls._instance

    def __init__(self):
        if hasattr(self, '_initialized') and self._initialized:
            return
            
        self.api_keys = []
        
        # Look for GEMINI_API_KEY, GEMINI_API_KEY_1, GEMINI_API_KEY_2, etc.
        key_dict = {}
        for k, v in os.environ.items():
            if k.startswith("GEMINI_API_KEY") and v.strip():
                # Extract suffix if exists
                suffix = k.replace("GEMINI_API_KEY", "").strip("_")
                try:
                    num = int(suffix) if suffix else 0
                except ValueError:
                    num = 999 # Fallback for malformed suffixes
                key_dict[k] = (num, v.strip())
        
        # Sort by number to ensure Key 1, Key 2, etc. are used in order
        sorted_keys = sorted(key_dict.items(), key=lambda x: x[1][0])
        for k, (num, v) in sorted_keys:
            self.api_keys.append(v)
            
        if not self.api_keys:
            logger.error("No Gemini API keys found in .env file.")
            raise ValueError("Missing Gemini API keys in .env")

        self.current_key_index = 0
        self._initialized = True
        self.model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
        self.model = None
        
        logger.info(f"Initialized Gemini Manager with {len(self.api_keys)} keys.")
        self._configure_current_key()

    def _configure_current_key(self):
        current_key = self.api_keys[self.current_key_index]
        genai.configure(api_key=current_key)
        self.model = genai.GenerativeModel(self.model_name)
        logger.info(f"Using Gemini Key #{self.current_key_index + 1}")
        
    def switch_to_next_key(self):
        """Switches to the next available key if the current one is exhausted."""
        if self.current_key_index < len(self.api_keys) - 1:
            logger.warning(f"Gemini Key #{self.current_key_index + 1} quota exhausted. Switching to Key #{self.current_key_index + 2}")
            self.current_key_index += 1
            self._configure_current_key()
            return True
        else:
            logger.error("All Gemini API keys have been exhausted.")
            return False

    def execute_with_fallback(self, prompt):
        """
        Executes generate_content with automatic key rotation on quota/resource failure.
        """
        while True:
            try:
                response = self.model.generate_content(prompt)
                return response
            except Exception as e:
                error_msg = str(e).lower()
                is_quota_error = any(keyword in error_msg for keyword in [
                    "429", "quota", "exhausted", "rate limit", "too many requests"
                ])
                
                if is_quota_error or "429" in error_msg or e.__class__.__name__ in ["ResourceExhausted", "TooManyRequests"]:
                    # Try to switch to the next key and retry
                    if self.switch_to_next_key():
                        continue 
                    else:
                        raise RuntimeError("All Gemini API keys exhausted.") from e
                else:
                    # For non-quota errors, we should re-raise immediately
                    raise e
