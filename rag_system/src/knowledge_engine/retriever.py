import logging
from typing import Dict, Any, List
from rag_system.src.chroma_manager import ChromaDBManager

logger = logging.getLogger(__name__)

class KnowledgeRetriever:
    def __init__(self):
        self.chroma_manager = ChromaDBManager()
        
    def search(self, query: str, filters: Dict[str, Any] = None, crop: str = None, topic: str = None, top_k: int = 5) -> Dict[str, Any]:
        """
        Hierarchical retrieval:
        1. Metadata Filter (crop, topic)
        2. Semantic Search using ChromaDB
        3. Document & Section Grouping
        """
        # 1. Build Metadata Filter
        where_filter = {}
        if filters:
            where_filter.update(filters)
        if crop:
            where_filter["crop"] = crop
        if topic:
            where_filter["topic"] = topic
            
        # If where_filter has multiple conditions, Chroma expects $and operator.
        # For simplicity, if empty, set it to None for Chroma
        chroma_where = None
        if len(where_filter) == 1:
            chroma_where = where_filter
        elif len(where_filter) > 1:
            chroma_where = {"$and": [{k: v} for k, v in where_filter.items()]}
            
        logger.info(f"Executing search with filter: {chroma_where}")
        
        # 2. Semantic Search (This simulates Document -> Section -> Semantic Search by relying on Chroma's semantic ranking + metadata filters)
        # Note: A true multi-step hierarchical retriever would first retrieve top documents, then top sections within those documents.
        # Here we perform an optimized vector search that inherently ranks the best chunks, and we reconstruct the hierarchy.
        
        try:
            # Embed the query using the custom embedder to match 1024 dimension (bge-m3)
            query_embedding = self.chroma_manager.embedder.embed_query(query)
            
            results = self.chroma_manager.collection.query(
                query_embeddings=[query_embedding],
                n_results=top_k,
                where=chroma_where if chroma_where else None
            )
        except Exception as e:
            logger.error(f"Error querying ChromaDB: {e}")
            results = {"documents": [[]], "metadatas": [[]], "distances": [[]]}
            
        retrieved_documents = []
        retrieved_sections = []
        retrieved_chunks = []
        citations = []
        
        if results and "documents" in results and results["documents"] and results["documents"][0]:
            docs = results["documents"][0]
            metas = results["metadatas"][0]
            distances = results.get("distances", [[0] * len(docs)])[0]
            
            for doc, meta, distance in zip(docs, metas, distances):
                # 3. Structure the output
                doc_source = meta.get("source", "unknown")
                section_title = meta.get("section", "unknown")
                subsection_title = meta.get("subSection", "")
                page = meta.get("page", 1)
                
                # Convert distance to a similarity score (approximate for cosine)
                # ChromaDB's cosine distance is usually 1 - cosine_similarity. So similarity = 1 - distance
                score = max(0.0, 1.0 - distance)
                
                # Deduplicate structured items safely
                doc_dict = {"title": doc_source, "maxScore": score}
                sec_dict = {"documentId": doc_source, "title": section_title, "maxScore": score}
                
                # Add to documents if not exists
                if not any(d["title"] == doc_source for d in retrieved_documents):
                    retrieved_documents.append(doc_dict)
                else:
                    # Update max score
                    for d in retrieved_documents:
                        if d["title"] == doc_source:
                            d["maxScore"] = max(d["maxScore"], score)
                            
                # Add to sections if not exists
                if not any(s["documentId"] == doc_source and s["title"] == section_title for s in retrieved_sections):
                    retrieved_sections.append(sec_dict)
                else:
                    for s in retrieved_sections:
                        if s["documentId"] == doc_source and s["title"] == section_title:
                            s["maxScore"] = max(s["maxScore"], score)
                
                chunk_data = {
                    "document": doc_source,
                    "page": page,
                    "section": section_title,
                    "subsection": subsection_title,
                    "similarity_score": score,
                    "text": doc,
                    "metadata": meta
                }
                
                retrieved_chunks.append(chunk_data)
                
                citation = {
                    "document": doc_source,
                    "page": page,
                    "section": section_title,
                    "subsection": subsection_title,
                    "title": meta.get("title", section_title)
                }
                if citation not in citations:
                    citations.append(citation)
                    
        return {
            "retrievedDocuments": retrieved_documents,
            "retrievedSections": retrieved_sections,
            "retrievedChunks": retrieved_chunks,
            "citations": citations
        }
