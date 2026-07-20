import os
import shutil
import logging

try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None

logger = logging.getLogger(__name__)

REJECTED_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../rag_system/knowledge/rejected'))

class DocumentValidator:
    def __init__(self, rejected_dir: str = REJECTED_DIR):
        self.rejected_dir = rejected_dir
        os.makedirs(self.rejected_dir, exist_ok=True)

    def validate(self, file_path: str) -> bool:
        """
        Validates the document. Returns True if valid, False otherwise.
        If invalid, moves the document to the rejected folder.
        """
        if not os.path.exists(file_path):
            logger.error(f"Validator: File not found {file_path}")
            return False
            
        ext = os.path.splitext(file_path)[1].lower()
        
        is_valid = False
        reason = "Unknown"
        
        if ext == '.pdf':
            is_valid, reason = self._validate_pdf(file_path)
        else:
            # Phase 1: Only PDFs are rigorously validated, others pass if they have size > 0
            size = os.path.getsize(file_path)
            if size > 0:
                is_valid = True
            else:
                reason = "Empty file"
                
        if not is_valid:
            logger.warning(f"Validation failed for {file_path}: {reason}")
            self._reject_file(file_path)
            return False
            
        return True

    def _validate_pdf(self, file_path: str) -> tuple[bool, str]:
        if not fitz:
            logger.warning("PyMuPDF not installed, skipping rigorous PDF validation.")
            return os.path.getsize(file_path) > 0, "PyMuPDF not available"
            
        try:
            doc = fitz.open(file_path)
            if doc.is_encrypted:
                doc.close()
                return False, "PDF is encrypted/password protected"
                
            if len(doc) == 0:
                doc.close()
                return False, "PDF has 0 pages"
                
            # Check if at least some text is readable (heuristic: > 50 characters in the first few pages)
            text_len = 0
            for i in range(min(3, len(doc))):
                text_len += len(doc[i].get_text("text").strip())
                
            doc.close()
            
            if text_len < 20:
                # Might be a scanned PDF or empty
                return False, "PDF has unreadable text or is mostly empty/images"
                
            return True, "Valid"
            
        except Exception as e:
            return False, f"Corrupted PDF or PyMuPDF error: {e}"

    def _reject_file(self, file_path: str):
        try:
            file_name = os.path.basename(file_path)
            dest_path = os.path.join(self.rejected_dir, file_name)
            shutil.move(file_path, dest_path)
            logger.info(f"Moved invalid file to rejected: {dest_path}")
        except Exception as e:
            logger.error(f"Failed to move rejected file {file_path}: {e}")
