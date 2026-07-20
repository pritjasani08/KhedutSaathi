import os
import sys
import logging

# Ensure project root is in python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../')))

from rag_system.src.acquisition.config import AcquisitionConfig
from rag_system.src.acquisition.manifest import AcquisitionManifest
from rag_system.src.acquisition.downloader import DocumentDownloader
from rag_system.src.acquisition.validator import DocumentValidator
from rag_system.src.acquisition.organizer import DocumentOrganizer
from rag_system.src.acquisition.metadata import MetadataGenerator
from rag_system.src.acquisition.connectors import (
    ICARConnector, FAOConnector, JAUConnector, PAUConnector, TNAUConnector
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def run_acquisition():
    logger.info("Starting Agricultural Knowledge Acquisition Pipeline...")
    
    config = AcquisitionConfig()
    manifest = AcquisitionManifest()
    downloader = DocumentDownloader(manifest)
    validator = DocumentValidator()
    organizer = DocumentOrganizer()
    metadata_gen = MetadataGenerator()
    
    connectors = [
        ICARConnector(config.get_source_config("ICAR")),
        FAOConnector(config.get_source_config("FAO")),
        JAUConnector(config.get_source_config("JAU")),
        PAUConnector(config.get_source_config("PAU")),
        TNAUConnector(config.get_source_config("TNAU")),
    ]
    
    total_discovered = 0
    total_downloaded = 0
    total_validated = 0
    total_organized = 0
    
    for connector in connectors:
        logger.info(f"--- Running Connector: {connector.source_name} ---")
        
        try:
            discovered_docs = connector.discover_documents()
            total_discovered += len(discovered_docs)
            logger.info(f"Discovered {len(discovered_docs)} documents from {connector.source_name}")
            
            for doc_info in discovered_docs:
                url = doc_info.get("document_url")
                title = doc_info.get("title")
                source = doc_info.get("source")
                
                # Check inclusion/exclusion rules
                if not config.should_include(source, title) and not config.should_include(source, url):
                    logger.info(f"Filtered out by config: {title}")
                    continue
                
                # Download
                temp_path, file_hash = downloader.download(url)
                if not temp_path or not file_hash:
                    continue  # Skipped or failed
                total_downloaded += 1
                
                # Validate
                if not validator.validate(temp_path):
                    continue
                total_validated += 1
                
                # Organize
                final_path = organizer.organize(temp_path, source, title)
                total_organized += 1
                
                # Metadata
                metadata_gen.generate(doc_info, file_hash, final_path)
                
                # Update manifest files hash
                manifest.record_file_hash(file_hash, final_path)
                manifest.mark_url_downloaded(url, "success")
                
        except Exception as e:
            logger.error(f"Error executing {connector.source_name} pipeline: {e}")
            
    logger.info("--- Acquisition Pipeline Complete ---")
    logger.info(f"Total Discovered: {total_discovered}")
    logger.info(f"Total Downloaded: {total_downloaded}")
    logger.info(f"Total Validated: {total_validated}")
    logger.info(f"Total Organized: {total_organized}")

if __name__ == "__main__":
    run_acquisition()
