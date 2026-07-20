import os
import shutil
import json
import logging
import sys

# Ensure project root is in python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

DOWNLOADS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../knowledge/downloads'))
DOCUMENTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../knowledge/documents'))
METADATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../knowledge/metadata'))

def approve_all():
    """
    (DEVELOPMENT ONLY) Automatically approves all downloaded documents, 
    moves them to the Knowledge Engine's expected source directory, 
    and marks their metadata as approved.
    """
    if not os.path.exists(METADATA_DIR):
        logger.error("Metadata directory does not exist.")
        return
        
    approved_count = 0
    for meta_file in os.listdir(METADATA_DIR):
        if not meta_file.endswith(".json"):
            continue
            
        meta_path = os.path.join(METADATA_DIR, meta_file)
        try:
            with open(meta_path, 'r', encoding='utf-8') as f:
                metadata = json.load(f)
                
            if metadata.get("approved"):
                continue # Already approved
                
            local_path = metadata.get("localPath")
            source = metadata.get("source", "Unknown")
            
            if not local_path or not os.path.exists(local_path):
                logger.warning(f"File not found for metadata {meta_file}: {local_path}")
                continue
                
            # Create destination directory: documents/<SOURCE>/
            dest_dir = os.path.join(DOCUMENTS_DIR, source)
            os.makedirs(dest_dir, exist_ok=True)
            
            file_name = os.path.basename(local_path)
            dest_path = os.path.join(dest_dir, file_name)
            
            # Move the file
            shutil.move(local_path, dest_path)
            
            # Update metadata
            metadata["approved"] = True
            metadata["status"] = "approved"
            metadata["localPath"] = dest_path  # Point to the new location
            
            with open(meta_path, 'w', encoding='utf-8') as f:
                json.dump(metadata, f, indent=4)
                
            logger.info(f"Approved and moved {file_name} to {dest_dir}")
            approved_count += 1
            
        except Exception as e:
            logger.error(f"Failed to approve document {meta_file}: {e}")
            
    logger.info(f"Total documents approved: {approved_count}")

if __name__ == "__main__":
    approve_all()
