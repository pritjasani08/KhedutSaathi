import fitz  # PyMuPDF
import os
import json
import logging
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

class DocumentParser:
    def __init__(self, file_path: str):
        self.file_path = file_path
        
    def parse(self) -> Dict[str, Any]:
        """
        Parses a PDF file and extracts text, headings, and structure preserving pages.
        Caches the parsed structure to avoid re-parsing identical PDFs.
        Returns a structured dictionary representing the document.
        """
        if not os.path.exists(self.file_path):
            raise FileNotFoundError(f"File not found: {self.file_path}")
            
        cache_path = self.file_path + ".structure.json"
        if os.path.exists(cache_path):
            try:
                with open(cache_path, 'r', encoding='utf-8') as f:
                    logger.info(f"Loaded parsed structure from cache: {cache_path}")
                    return json.load(f)
            except Exception as e:
                logger.warning(f"Failed to load cache {cache_path}: {e}")
            
        logger.info(f"Parsing document: {self.file_path}")
        doc = fitz.open(self.file_path)
        
        document_structure = {
            "title": os.path.basename(self.file_path).replace(".pdf", ""),
            "source": self.file_path,
            "total_pages": len(doc),
            "pages": [],
            "sections": []
        }
        
        current_section = None
        current_subsection = None
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            blocks = page.get_text("dict").get("blocks", [])
            
            page_content = {
                "page_num": page_num + 1,
                "text": page.get_text("text")
            }
            document_structure["pages"].append(page_content)
            
            for block in blocks:
                if "lines" not in block:
                    continue
                    
                block_text_parts = []
                is_h1 = False
                is_h2 = False
                
                for line in block["lines"]:
                    for span in line["spans"]:
                        text = span["text"].strip()
                        if not text:
                            continue
                            
                        # Heuristics for headings
                        size = span["size"]
                        is_bold = "bold" in span["font"].lower() or "heavy" in span["font"].lower() or "black" in span["font"].lower()
                        
                        if size > 14 or (size > 12 and is_bold):
                            is_h1 = True
                        elif size > 11 and is_bold:
                            is_h2 = True
                            
                        block_text_parts.append(text)
                        
                block_text = " ".join(block_text_parts).strip()
                if not block_text:
                    continue
                    
                if is_h1:
                    # Start a new section
                    if current_section and current_section["title"] == block_text:
                        continue # ignore duplicates
                    current_section = {
                        "title": block_text,
                        "start_page": page_num + 1,
                        "end_page": page_num + 1,
                        "subsections": []
                    }
                    current_subsection = None
                    document_structure["sections"].append(current_section)
                elif is_h2:
                    if not current_section:
                        current_section = {
                            "title": "Introduction",
                            "start_page": page_num + 1,
                            "end_page": page_num + 1,
                            "subsections": []
                        }
                        document_structure["sections"].append(current_section)
                        
                    if current_subsection and current_subsection["title"] == block_text:
                        continue
                        
                    current_subsection = {
                        "title": block_text,
                        "start_page": page_num + 1,
                        "paragraphs": []
                    }
                    current_section["subsections"].append(current_subsection)
                    current_section["end_page"] = max(current_section["end_page"], page_num + 1)
                else:
                    if not current_section:
                        current_section = {
                            "title": "Introduction",
                            "start_page": page_num + 1,
                            "end_page": page_num + 1,
                            "subsections": []
                        }
                        document_structure["sections"].append(current_section)
                    
                    if not current_subsection:
                        current_subsection = {
                            "title": "General",
                            "start_page": page_num + 1,
                            "paragraphs": []
                        }
                        current_section["subsections"].append(current_subsection)
                        
                    current_subsection["paragraphs"].append({
                        "text": block_text,
                        "page": page_num + 1
                    })
                    current_section["end_page"] = max(current_section["end_page"], page_num + 1)
                    
        doc.close()
        
        # Save cache
        try:
            with open(cache_path, 'w', encoding='utf-8') as f:
                json.dump(document_structure, f, indent=4)
        except Exception as e:
            logger.warning(f"Failed to write cache {cache_path}: {e}")
            
        return document_structure
