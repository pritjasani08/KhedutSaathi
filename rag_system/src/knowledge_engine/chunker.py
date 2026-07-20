import uuid
from typing import List, Dict, Any

class HierarchicalChunker:
    def __init__(self, max_chunk_size: int = 1000):
        self.max_chunk_size = max_chunk_size
        
    def chunk_document(self, document_structure: Dict[str, Any], doc_metadata: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        Takes a structured document and creates semantic chunks based on sections/subsections and paragraphs.
        """
        chunks = []
        doc_metadata = doc_metadata or {}
        doc_id = document_structure.get("title", "unknown_doc")
        
        for section in document_structure.get("sections", []):
            section_title = section.get("title", "")
            
            for subsection in section.get("subsections", []):
                subsection_title = subsection.get("title", "General")
                
                current_chunk_text = ""
                current_chunk_page = None
                
                for paragraph in subsection.get("paragraphs", []):
                    para_text = paragraph.get("text", "").strip()
                    para_page = paragraph.get("page", 1)
                    
                    if not current_chunk_page:
                        current_chunk_page = para_page
                        
                    # If adding this paragraph exceeds max chunk size AND we already have content
                    if len(current_chunk_text) + len(para_text) + 1 > self.max_chunk_size and current_chunk_text.strip():
                        chunks.append(self._create_chunk(
                            doc_id, current_chunk_page, section_title, subsection_title, 
                            current_chunk_text.strip(), doc_metadata
                        ))
                        current_chunk_text = para_text + " "
                        current_chunk_page = para_page
                    else:
                        current_chunk_text += para_text + " "
                        
                if current_chunk_text.strip():
                    chunks.append(self._create_chunk(
                        doc_id, current_chunk_page, section_title, subsection_title, 
                        current_chunk_text.strip(), doc_metadata
                    ))
                    
        return chunks
        
    def _create_chunk(self, doc_id: str, page: int, section_title: str, subsection_title: str, text: str, doc_metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Creates a standardized chunk dictionary."""
        return {
            "id": str(uuid.uuid4()),
            "documentId": doc_id,
            "page": page,
            "section": section_title,
            "subSection": subsection_title,
            "title": f"{doc_id} - {section_title} - {subsection_title}",
            "text": text,
            "keywords": doc_metadata.get("keywords", []),
            "summary": "",
            "crop": doc_metadata.get("crop"),
            "topic": doc_metadata.get("topic"),
            "growth_stage": doc_metadata.get("growth_stage"),
            "season": doc_metadata.get("season"),
            "region": doc_metadata.get("region"),
            "document_type": doc_metadata.get("document_type"),
            "languages": doc_metadata.get("languages", ["English"]),
            "source": doc_metadata.get("source")
        }
