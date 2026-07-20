import os
import json
import time
import sys

# Ensure project root is in python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from rag_system.src.knowledge_engine.retriever import KnowledgeRetriever

BENCHMARK_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../knowledge/benchmark_dataset.json'))
REPORT_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../knowledge/retrieval_benchmark_report.md'))

def evaluate():
    print("Starting Automated Retrieval Evaluation...")
    
    if not os.path.exists(BENCHMARK_PATH):
        print(f"Benchmark dataset not found at {BENCHMARK_PATH}")
        return
        
    with open(BENCHMARK_PATH, 'r', encoding='utf-8') as f:
        benchmarks = json.load(f)
        
    if not benchmarks:
        print("No benchmarks found.")
        return
        
    retriever = KnowledgeRetriever()
    
    total = len(benchmarks)
    doc_hits = 0
    section_hits = 0
    total_latency_ms = 0
    
    for i, benchmark in enumerate(benchmarks):
        query = benchmark["question"]
        expected = benchmark["expected"]
        
        # We simulate a generic query without strict filters to test semantic retrieval
        start_time = time.time()
        results = retriever.search(
            query=query,
            filters={},
            crop=None,
            topic=None,
            top_k=5  # Top 5 to see if expected document/section is retrieved
        )
        latency_ms = (time.time() - start_time) * 1000
        total_latency_ms += latency_ms
        
        retrieved_docs = results.get("retrievedDocuments", [])
        retrieved_sections = results.get("retrievedSections", [])
        
        # Check if the expected document is in the retrieved docs
        doc_found = any(doc.get("title") == expected["document"] for doc in retrieved_docs)
        if doc_found:
            doc_hits += 1
            
        # Check if the expected section is specifically retrieved
        section_found = any(s.get("documentId") == expected["document"] and s.get("title") == expected["section"] for s in retrieved_sections)
                
        if section_found:
            section_hits += 1
            
        print(f"[{i+1}/{total}] Query: '{query[:40]}...' | Doc Hit: {doc_found} | Sec Hit: {section_found} | {latency_ms:.1f}ms")
            
    avg_latency = total_latency_ms / total
    doc_accuracy = (doc_hits / total) * 100
    sec_accuracy = (section_hits / total) * 100
    
    report = f"""# Knowledge Engine Retrieval Benchmark Report

## Overview
- **Total Queries Executed**: {total}
- **Average Retrieval Latency**: {avg_latency:.2f} ms

## Accuracy Metrics
- **Document Accuracy (Top 5)**: {doc_accuracy:.1f}% ({doc_hits}/{total})
  *(Did the engine retrieve the correct document?)*
- **Section Accuracy (Top 5)**: {sec_accuracy:.1f}% ({section_hits}/{total})
  *(Did the engine retrieve the exact correct hierarchical section?)*

*Note: This benchmark focuses entirely on unsupervised semantic retrieval capability based on ChromaDB distance scoring, relying heavily on the embedded hierarchy generated during ingestion.*
"""

    with open(REPORT_PATH, 'w', encoding='utf-8') as f:
        f.write(report)
        
    print(f"\nEvaluation Complete. Report saved to {REPORT_PATH}")
    print(f"Document Accuracy: {doc_accuracy:.1f}%")
    print(f"Section Accuracy: {sec_accuracy:.1f}%")

if __name__ == "__main__":
    evaluate()
