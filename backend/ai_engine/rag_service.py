import os
import sys
from typing import List, Dict, Any

# Ensure rag_system is in the python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

try:
    from rag_system.src.retriever import Retriever
    rag_retriever = Retriever()
except ImportError:
    rag_retriever = None

class RAGService:
    @staticmethod
    def retrieve_knowledge(context: Dict[str, Any], candidates: List[Any], top_k: int = 3) -> List[str]:
        """
        Extracts key queries from the CandidateDecisions and fetches relevant
        documents from the existing RAG pipeline.
        """
        if not rag_retriever:
            return ["RAG pipeline unavailable or not configured."]
            
        queries = []
        for candidate in candidates:
            # Build query based on title and trigger
            query = f"{candidate.title} related to {candidate.trigger}"
            if candidate.type == "DISEASE" and "disease" in candidate.rawFacts:
                query += f" treatment for {candidate.rawFacts['disease'].get('disease_name', '')}"
            queries.append(query)
            
        # Optional: could also add general location/crop based queries from FarmContext
        
        documents = []
        seen_chunks = set()
        
        for q in queries:
            results = rag_retriever.retrieve(q, top_k=top_k)
            for res in results:
                chunk = res.get("text", "")
                if chunk and chunk not in seen_chunks:
                    documents.append(chunk)
                    seen_chunks.add(chunk)
                    
        return documents
