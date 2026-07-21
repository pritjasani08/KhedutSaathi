import logging
from typing import Dict, Any, List
from rag_system.src.chroma_manager import ChromaDBManager
from rag_system.src.config import HYBRID_WEIGHTS, DUPLICATE_SIMILARITY
from rag_system.src.knowledge_engine.reranker import KnowledgeReranker
import math

logger = logging.getLogger(__name__)

class KnowledgeRetriever:
    def __init__(self):
        self.chroma_manager = ChromaDBManager()
        self.reranker = KnowledgeReranker()
        
    def search(self, query: str, filters: Dict[str, Any] = None, crop: str = None, topic: str = None, 
               state: str = None, district: str = None, season: str = None, soilType: str = None, top_k: int = 5) -> Dict[str, Any]:
        """
        Hierarchical retrieval:
        1. Semantic Search using ChromaDB (Top 30 chunks)
        2. Hybrid Scoring (Semantic + Metadata matching)
        3. Cross-Encoder Reranking
        4. Document & Section Grouping
        """
        logger.info(f"Executing search for query: '{query}'")
        
        # 1. Broad Vector Search (Get top 30 to allow hybrid scoring)
        initial_k = 30
        
        try:
            # Embed the query using the custom embedder to match 1024 dimension (bge-m3)
            query_embedding = self.chroma_manager.embedder.embed_query(query)
            
            # We skip hard filtering to allow fallback documents (e.g. national ICAR docs) 
            # if specific state docs aren't found.
            results = self.chroma_manager.collection.query(
                query_embeddings=[query_embedding],
                n_results=initial_k,
                include=["documents", "metadatas", "distances", "embeddings"]
            )
        except Exception as e:
            logger.error(f"Error querying ChromaDB: {e}")
            results = {"documents": [[]], "metadatas": [[]], "distances": [[]]}
            
        retrieved_chunks = []
        
        if results and "documents" in results and results["documents"] and results["documents"][0]:
            docs = results["documents"][0]
            metas = results["metadatas"][0]
            distances = results.get("distances", [[0] * len(docs)])[0]
            embeddings = results.get("embeddings", [[None] * len(docs)])[0]
            
            for i, (doc, meta, distance, emb) in enumerate(zip(docs, metas, distances, embeddings)):
                doc_source = meta.get("source", "unknown")
                section_title = meta.get("section", "unknown")
                subsection_title = meta.get("subSection", "")
                page = meta.get("page", 1)
                
                # Semantic similarity score
                semantic_score = max(0.0, 1.0 - distance)
                
                # 2. Hybrid Scoring
                hybrid_score = semantic_score * HYBRID_WEIGHTS.get("semantic", 0.40)
                
                # Crop Match
                doc_crop = meta.get("crop")
                if doc_crop and crop and (crop.lower() in doc_crop.lower() or doc_crop.lower() in crop.lower()):
                    hybrid_score += HYBRID_WEIGHTS.get("crop", 0.25)
                    
                # Region Match (State / District)
                doc_region = meta.get("region")
                if doc_region:
                    if state and state.lower() in doc_region.lower():
                        hybrid_score += HYBRID_WEIGHTS.get("region", 0.20) * 0.7  # State match
                    if district and district.lower() in doc_region.lower():
                        hybrid_score += HYBRID_WEIGHTS.get("region", 0.20) * 0.3  # District match
                
                # Season / Topic Match
                doc_season = meta.get("season")
                if doc_season and season and (season.lower() in doc_season.lower()):
                    hybrid_score += HYBRID_WEIGHTS.get("season", 0.15)
                    
                chunk_data = {
                    "document": doc_source,
                    "page": page,
                    "section": section_title,
                    "subsection": subsection_title,
                    "similarity_score": semantic_score, # raw semantic
                    "hybrid_score": hybrid_score, # combined
                    "text": doc,
                    "metadata": meta,
                    "embedding": emb,
                    "original_rank": i + 1
                }
                
                retrieved_chunks.append(chunk_data)
                
        # Sort by hybrid score
        retrieved_chunks.sort(key=lambda x: x["hybrid_score"], reverse=True)
        
        # Take Top 10 for Reranking
        top_hybrid = retrieved_chunks[:10]
        
        # 3. Cross-Encoder Reranking (returns all 10)
        reranked_chunks = self.reranker.rerank(query, top_hybrid, top_k=10)
        
        # 4. Evidence Deduplication & Diversity Selection
        final_chunks = []
        
        def cosine_sim(v1, v2):
            if not v1 or not v2:
                return 0.0
            dot = sum(a*b for a, b in zip(v1, v2))
            norm1 = math.sqrt(sum(a*a for a in v1))
            norm2 = math.sqrt(sum(b*b for b in v2))
            return dot / (norm1 * norm2) if norm1 > 0 and norm2 > 0 else 0.0
            
        rank_counter = 1
        for chunk in reranked_chunks:
            if len(final_chunks) >= top_k:
                break
                
            is_duplicate = False
            for selected in final_chunks:
                # Same document and section (and close page)
                same_doc = chunk["document"] == selected["document"]
                same_section = chunk["section"] == selected["section"]
                same_page = chunk["page"] == selected["page"]
                
                if same_doc and same_section and same_page:
                    is_duplicate = True
                    break
                    
                # Cosine similarity check (if embeddings are available)
                if "embedding" in chunk and "embedding" in selected:
                    sim = cosine_sim(chunk["embedding"], selected["embedding"])
                    if sim >= DUPLICATE_SIMILARITY:
                        is_duplicate = True
                        break
                        
            if not is_duplicate:
                # Update score for grouping logic
                chunk["score"] = chunk.get("rerank_score", chunk["hybrid_score"])
                chunk["final_rank"] = rank_counter
                
                # Build diagnostics object
                chunk["diagnostics"] = {
                    "semantic_score": chunk.get("similarity_score", 0.0),
                    "hybrid_score": chunk.get("hybrid_score", 0.0),
                    "reranker_score": chunk.get("rerank_score", 0.0),
                    "original_rank": chunk.get("original_rank", 0),
                    "final_rank": chunk.get("final_rank", 0)
                }
                
                # Remove embedding to prevent huge JSON payloads
                if "embedding" in chunk:
                    del chunk["embedding"]
                final_chunks.append(chunk)
                rank_counter += 1
        
        # 4. Grouping & Citations
        retrieved_documents = []
        retrieved_sections = []
        citations = []
        
        for chunk in final_chunks:
            doc_source = chunk["document"]
            section_title = chunk["section"]
            
            # Use rerank_score if available, else hybrid_score
            final_score = chunk.get("rerank_score", chunk["hybrid_score"])
            # Update chunk score so frontend can show final relevance
            chunk["score"] = final_score
            
            doc_dict = {"title": doc_source, "maxScore": final_score}
            sec_dict = {"documentId": doc_source, "title": section_title, "maxScore": final_score}
            
            if not any(d["title"] == doc_source for d in retrieved_documents):
                retrieved_documents.append(doc_dict)
            else:
                for d in retrieved_documents:
                    if d["title"] == doc_source:
                        d["maxScore"] = max(d["maxScore"], final_score)
                        
            if not any(s["documentId"] == doc_source and s["title"] == section_title for s in retrieved_sections):
                retrieved_sections.append(sec_dict)
            else:
                for s in retrieved_sections:
                    if s["documentId"] == doc_source and s["title"] == section_title:
                        s["maxScore"] = max(s["maxScore"], final_score)
                        
            citation = {
                "document": doc_source,
                "page": chunk["page"],
                "section": section_title,
                "subsection": chunk["subsection"],
                "title": chunk["metadata"].get("title", section_title)
            }
            if citation not in citations:
                citations.append(citation)
                
        return {
            "retrievedDocuments": retrieved_documents,
            "retrievedSections": retrieved_sections,
            "retrievedChunks": final_chunks,
            "citations": citations
        }
