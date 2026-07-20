import os
import sys
import json
import logging

# Ensure project root is in python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

# Suppress chroma logs for clean CLI
logging.getLogger("chromadb").setLevel(logging.ERROR)
logging.getLogger("httpx").setLevel(logging.ERROR)
logging.getLogger("sentence_transformers").setLevel(logging.ERROR)

from rag_system.src.knowledge_engine.retriever import KnowledgeRetriever

def print_separator(char="-", length=80):
    print(char * length)

def main():
    print_separator("=")
    print("🌾 KhedutSaathi Knowledge Explorer (Developer CLI) 🌾")
    print_separator("=")
    print("Type a query to test retrieval. Type 'quit' or 'exit' to stop.")
    
    retriever = KnowledgeRetriever()
    
    while True:
        try:
            query = input("\nQuery > ")
            if query.strip().lower() in ['quit', 'exit']:
                break
            if not query.strip():
                continue
                
            print("\nSearching...")
            results = retriever.search(query, top_k=3)
            
            print_separator()
            print(f"RESULTS FOR: '{query}'")
            print_separator()
            
            docs = results.get("retrievedDocuments", [])
            print(f"Top Documents ({len(docs)}):")
            for doc in docs:
                print(f"  📄 {doc['title']} (Score: {doc.get('maxScore', 0):.4f})")
                
            print("\nTop Chunks (Context that will be sent to the LLM):")
            chunks = results.get("retrievedChunks", [])
            for i, chunk in enumerate(chunks):
                print(f"\n[{i+1}] -----------------------------")
                print(f"Document: {chunk.get('document')} (Page {chunk.get('page')})")
                print(f"Section:  {chunk.get('section')}")
                if chunk.get('subsection'):
                    print(f"SubSec:   {chunk.get('subsection')}")
                
                # Display extended metadata
                meta = chunk.get("metadata", {})
                meta_str = []
                for k in ["crop", "topic", "source", "languages", "document_type"]:
                    if meta.get(k):
                        meta_str.append(f"{k.capitalize()}: {meta[k]}")
                if meta_str:
                    print(f"Metadata: | {' | '.join(meta_str)} |")
                    
                print(f"Score: {chunk.get('similarity_score', 0):.4f}")
                print(f"Text Preview: {chunk.get('text', '')[:200]}...")
                
            print("\n")
            
        except KeyboardInterrupt:
            break
        except Exception as e:
            print(f"\nError: {e}")

if __name__ == "__main__":
    main()
