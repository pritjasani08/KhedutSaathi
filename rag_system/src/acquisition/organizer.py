import os
import shutil
import logging

logger = logging.getLogger(__name__)

DOWNLOADS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../rag_system/knowledge/downloads'))

# Basic known crops list for Phase 1 categorization
KNOWN_CROPS = [
    "Groundnut", "Cotton", "Rice", "Wheat", "Maize", "Sugarcane", 
    "Soybean", "Mustard", "Chickpea", "Pigeonpea", "Pearl Millet", 
    "Sorghum", "Banana", "Mango", "Potato", "Tomato", "Onion"
]

class DocumentOrganizer:
    def __init__(self, downloads_dir: str = DOWNLOADS_DIR):
        self.downloads_dir = downloads_dir

    def determine_crop(self, text: str) -> str:
        """
        Simple heuristic: searches for crop names in the text.
        Returns the crop name or 'Uncategorized'.
        """
        text_lower = text.lower()
        for crop in KNOWN_CROPS:
            if crop.lower() in text_lower:
                return crop
        return "Uncategorized"

    def organize(self, temp_file_path: str, source: str, document_title: str) -> str:
        """
        Moves the temporary file to its final destination:
        downloads/<SOURCE>/<CROP>/<FILENAME>
        Returns the final local path.
        """
        crop_category = self.determine_crop(document_title)
        
        final_dir = os.path.join(self.downloads_dir, source, crop_category)
        os.makedirs(final_dir, exist_ok=True)
        
        # Use document title or original filename if title is generic
        ext = os.path.splitext(temp_file_path)[1]
        
        safe_title = "".join([c for c in document_title if c.isalpha() or c.isdigit() or c==' ']).rstrip()
        safe_title = safe_title.replace(" ", "_")
        if not safe_title:
            safe_title = f"Document_{os.path.basename(temp_file_path)}"
            
        final_file_name = f"{safe_title}{ext}"
        final_path = os.path.join(final_dir, final_file_name)
        
        # Ensure unique filename
        counter = 1
        while os.path.exists(final_path):
            final_file_name = f"{safe_title}_{counter}{ext}"
            final_path = os.path.join(final_dir, final_file_name)
            counter += 1
            
        try:
            shutil.move(temp_file_path, final_path)
            logger.info(f"Organized document into {final_path}")
            return final_path
        except Exception as e:
            logger.error(f"Failed to move document to {final_path}: {e}")
            return temp_file_path
