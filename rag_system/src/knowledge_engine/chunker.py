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
        
    def _infer_metadata(self, doc_id: str, section_title: str, text: str, doc_metadata: Dict[str, Any]) -> Dict[str, Any]:
        """
        Infers metadata based on priority:
        1. Explicit doc_metadata
        2. Section heading
        3. Document title (doc_id)
        4. Pattern matching in text
        """
        inferred = doc_metadata.copy()

        # Define some common agricultural entities for pattern matching
        KNOWN_CROPS = [
            "cotton", "groundnut", "wheat", "paddy", "rice", "maize", "sugarcane", 
            "soybean", "mustard", "chickpea", "pigeonpea", "pearl millet", "sorghum",
            "tomato", "potato", "onion", "garlic", "chilli", "turmeric", "cumin", "coriander"
        ]
        KNOWN_INSTITUTIONS = ["tnau", "icar", "fao", "iari", "naus", "jau", "aau", "sdaus"]
        KNOWN_STATES = ["gujarat", "tamil nadu", "maharashtra", "punjab", "haryana", "rajasthan", "karnataka", "andhra pradesh", "madhya pradesh"]
        KNOWN_SEASONS = ["kharif", "rabi", "zaid", "summer", "winter", "monsoon"]
        KNOWN_SOIL_TYPES = ["black", "red", "alluvial", "laterite", "sandy", "clay", "loamy"]
        KNOWN_IRRIGATION = ["drip", "sprinkler", "flood", "furrow", "rainfed", "micro-irrigation"]

        def _find_matches(keywords, *sources):
            matches = set()
            for source in sources:
                source_lower = source.lower() if source else ""
                for kw in keywords:
                    if kw in source_lower:
                        # For rice/paddy equivalence
                        if kw == "rice" or kw == "paddy":
                            matches.add("Paddy")
                        else:
                            matches.add(kw.title())
            return list(matches)

        # 1. Infer Crops (allowing multiple)
        explicit_crop = doc_metadata.get("crop")
        if explicit_crop and explicit_crop != "General Crop" and explicit_crop != "General":
            # If explicit crop is passed and valid, use it. But often we get "General"
            inferred["crops"] = [explicit_crop]
        else:
            crops_found = _find_matches(KNOWN_CROPS, section_title, doc_id, text)
            if crops_found:
                inferred["crops"] = crops_found
            else:
                inferred["crops"] = ["General"]
        
        # For backward compatibility with single string logic
        inferred["crop"] = inferred["crops"][0] if inferred.get("crops") else "General"

        # 2. Infer Institution
        if not inferred.get("institution") or inferred.get("institution") == "General":
            insts = _find_matches(KNOWN_INSTITUTIONS, doc_id, text)
            # Default to TNAU for this specific corpus if not found, as per prompt hint "institution = TNAU" for these PDFs.
            # But we'll try to find it first.
            if insts:
                inferred["institution"] = insts[0].upper()
            else:
                inferred["institution"] = "TNAU" # Fallback for this specific Tamil Nadu corpus

        # 3. Infer State/Region
        explicit_region = doc_metadata.get("region")
        if explicit_region and explicit_region != "General":
            inferred["region"] = explicit_region
            inferred["state"] = explicit_region
        else:
            states = _find_matches(KNOWN_STATES, doc_id, section_title, text)
            if states:
                inferred["state"] = states[0]
                inferred["region"] = states[0]
            else:
                # If it's TNAU, it's highly likely Tamil Nadu. 
                if inferred.get("institution") == "TNAU":
                    inferred["state"] = "Tamil Nadu"
                    inferred["region"] = "Tamil Nadu"
                else:
                    inferred["state"] = "General"
                    inferred["region"] = "General"

        # 4. Infer Season
        if not inferred.get("season") or inferred.get("season") in ["General", "All Seasons"]:
            seasons = _find_matches(KNOWN_SEASONS, section_title, text)
            inferred["season"] = seasons[0] if seasons else "General"

        # 5. Infer Soil Type
        if not inferred.get("soil_type"):
            soils = _find_matches(KNOWN_SOIL_TYPES, section_title, text)
            if soils:
                inferred["soil_type"] = soils[0]

        # 6. Infer Irrigation Method
        if not inferred.get("irrigation_method"):
            irr = _find_matches(KNOWN_IRRIGATION, section_title, text)
            if irr:
                inferred["irrigation_method"] = irr[0]

        return inferred

    def _create_chunk(self, doc_id: str, page: int, section_title: str, subsection_title: str, text: str, doc_metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Creates a standardized chunk dictionary with inline context."""
        
        # Apply intelligent metadata extraction
        enriched_meta = self._infer_metadata(doc_id, section_title, text, doc_metadata)
        
        region = enriched_meta.get("region", "General")
        season = enriched_meta.get("season", "General")
        crops_list = enriched_meta.get("crops", ["General"])
        crop_str = ", ".join(crops_list)
        
        # Inject inline context into the chunk text so the embedder sees it
        context_header = f"Document: {doc_id} | Section: {section_title} | Region: {region} | Crop: {crop_str}\n"
        enhanced_text = context_header + text
        
        return {
            "id": str(uuid.uuid4()),
            "documentId": doc_id,
            "page": page,
            "section": section_title,
            "subSection": subsection_title,
            "title": f"{doc_id} - {section_title} - {subsection_title}",
            "text": enhanced_text,
            "raw_text": text, # Preserve original text
            "keywords": enriched_meta.get("keywords", []),
            "summary": "",
            "crops": crops_list, # Store as array
            "crop": enriched_meta.get("crop"), # Backward compatibility
            "institution": enriched_meta.get("institution"),
            "state": enriched_meta.get("state"),
            "soil_type": enriched_meta.get("soil_type"),
            "irrigation_method": enriched_meta.get("irrigation_method"),
            "topic": enriched_meta.get("topic"),
            "growth_stage": enriched_meta.get("growth_stage"),
            "season": enriched_meta.get("season"),
            "region": enriched_meta.get("region"),
            "document_type": enriched_meta.get("document_type"),
            "languages": enriched_meta.get("languages", ["English"]),
            "source": enriched_meta.get("source")
        }
