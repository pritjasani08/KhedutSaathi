"""
Improved retrieval benchmark with realistic queries against the TNAU agricultural documents.
Run: .\.venv\Scripts\python.exe rag_system\scripts\evaluate_retrieval_benchmark.py
"""
import sys
import os
import time

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

try:
    from rag_system.src.knowledge_engine.retriever import KnowledgeRetriever
    import torch
except Exception as e:
    print(f"Failed to import RAG components: {e}")
    sys.exit(1)

# Benchmark dataset matched to actual TNAU documents
# Benchmark dataset matched to actual TNAU documents (expanded to 30 diverse queries)
BENCHMARK_DATASET = [
    {"query": "What are the climate requirements and sowing dates for cotton?", "context": {"crop": "Cotton"}, "expected_keywords": ["cotton", "climate", "temperature", "sowing"]},
    {"query": "How to manage irrigation water requirement for wheat?", "context": {"crop": "Wheat"}, "expected_keywords": ["wheat", "irrigation", "water"]},
    {"query": "Paddy rice cultivation and water management", "context": {"crop": "Paddy"}, "expected_keywords": ["paddy", "rice", "water", "cultivation"]},
    {"query": "Pest and disease management for groundnut crop", "context": {"crop": "Groundnut"}, "expected_keywords": ["groundnut", "pest", "disease"]},
    {"query": "Fertilizer application and nutrient management for maize", "context": {"crop": "Maize"}, "expected_keywords": ["maize", "fertilizer", "nitrogen", "nutrient"]},
    {"query": "Drip irrigation for sugarcane", "context": {"crop": "Sugarcane"}, "expected_keywords": ["sugarcane", "drip", "irrigation"]},
    {"query": "Weed management in soybean", "context": {"crop": "Soybean"}, "expected_keywords": ["soybean", "weed", "herbicide"]},
    {"query": "Mustard sowing time in Gujarat", "context": {"crop": "Mustard", "state": "Gujarat"}, "expected_keywords": ["mustard", "sowing", "gujarat"]},
    {"query": "Chickpea wilt disease control", "context": {"crop": "Chickpea"}, "expected_keywords": ["chickpea", "wilt", "disease"]},
    {"query": "Pigeonpea spacing and seed rate", "context": {"crop": "Pigeonpea"}, "expected_keywords": ["pigeonpea", "spacing", "seed"]},
    {"query": "Pearl millet drought tolerance", "context": {"crop": "Pearl millet"}, "expected_keywords": ["pearl millet", "drought", "water"]},
    {"query": "Sorghum shoot fly management", "context": {"crop": "Sorghum"}, "expected_keywords": ["sorghum", "shoot fly", "pest"]},
    {"query": "Tomato early blight fungicide", "context": {"crop": "Tomato"}, "expected_keywords": ["tomato", "blight", "fungicide"]},
    {"query": "Potato tuber moth control", "context": {"crop": "Potato"}, "expected_keywords": ["potato", "tuber moth", "pest"]},
    {"query": "Onion thrips management", "context": {"crop": "Onion"}, "expected_keywords": ["onion", "thrips", "pest"]},
    {"query": "Garlic fertilizer recommendation", "context": {"crop": "Garlic"}, "expected_keywords": ["garlic", "fertilizer", "nutrient"]},
    {"query": "Chilli leaf curl virus", "context": {"crop": "Chilli"}, "expected_keywords": ["chilli", "leaf curl", "virus"]},
    {"query": "Turmeric rhizome rot", "context": {"crop": "Turmeric"}, "expected_keywords": ["turmeric", "rhizome rot", "disease"]},
    {"query": "Cumin blight management", "context": {"crop": "Cumin"}, "expected_keywords": ["cumin", "blight", "disease"]},
    {"query": "Coriander powdery mildew", "context": {"crop": "Coriander"}, "expected_keywords": ["coriander", "powdery mildew", "disease"]},
    {"query": "ICAR guidelines for Kharif crops", "context": {"season": "Kharif"}, "expected_keywords": ["kharif", "icar", "sowing"]},
    {"query": "FAO water conservation methods", "context": {}, "expected_keywords": ["fao", "water", "conservation"]},
    {"query": "Best practices for black soil", "context": {"soilType": "Black"}, "expected_keywords": ["black soil", "clay", "cotton"]},
    {"query": "Red soil nutrient deficiencies", "context": {"soilType": "Red"}, "expected_keywords": ["red soil", "nutrient", "deficiency"]},
    {"query": "Alluvial soil crop suitability", "context": {"soilType": "Alluvial"}, "expected_keywords": ["alluvial", "crop", "suitability"]},
    {"query": "Sprinkler irrigation design", "context": {}, "expected_keywords": ["sprinkler", "irrigation", "pressure"]},
    {"query": "Rainfed agriculture techniques in Rajasthan", "context": {"state": "Rajasthan"}, "expected_keywords": ["rainfed", "rajasthan", "dryland"]},
    {"query": "Green manure crops for Rabi season", "context": {"season": "Rabi"}, "expected_keywords": ["green manure", "rabi", "nitrogen"]},
    {"query": "Integrated Pest Management (IPM) strategies", "context": {}, "expected_keywords": ["integrated pest management", "ipm", "pest"]},
    {"query": "Organic farming certification process", "context": {}, "expected_keywords": ["organic", "certification", "standards"]}
]

def calculate_mrr(results, expected_keywords):
    for rank, res in enumerate(results, 1):
        text = (res.get('content', '') + " " + res.get('title', '')).lower()
        if any(kw in text for kw in expected_keywords):
            return 1.0 / rank
    return 0.0

def calculate_recall_at_k(results, expected_keywords, k=3):
    for res in results[:k]:
        text = (res.get('content', '') + " " + res.get('title', '')).lower()
        if any(kw in text for kw in expected_keywords):
            return 1.0
    return 0.0

def calculate_precision_at_k(results, expected_keywords, k=3):
    hits = sum(
        1 for res in results[:k]
        if any(kw in (res.get('content', '') + " " + res.get('title', '')).lower() for kw in expected_keywords)
    )
    return hits / k if k > 0 else 0.0

def run_benchmark():
    print("=" * 70)
    print("RAG RETRIEVAL BENCHMARK — KhedutSaathi Knowledge Engine")
    print("=" * 70)
    print("Initializing KnowledgeRetriever...")
    retriever = KnowledgeRetriever()

    total_latency = 0
    cold_latency = 0
    warm_latency_sum = 0
    total_mrr = 0
    total_recall_3 = 0
    total_precision_3 = 0

    print(f"\nRunning Benchmark on {len(BENCHMARK_DATASET)} queries...")
    print("-" * 70)

    for idx, item in enumerate(BENCHMARK_DATASET, 1):
        query = item['query']
        context = item['context']
        expected_kws = item['expected_keywords']

        print(f"\nQ{idx}: {query}")
        print(f"     Context: {context} | Expected keywords: {expected_kws}")

        start_time = time.time()
        res_dict = retriever.search(
            query=query,
            crop=context.get('crop'),
            state=context.get('state'),
            season=context.get('season'),
            top_k=10
        )
        latency = time.time() - start_time
        
        if idx == 1:
            cold_latency = latency
        else:
            warm_latency_sum += latency

        # Map retriever output format (retrievedChunks with 'text' key) 
        raw_chunks = res_dict.get('retrievedChunks', [])
        results = [{'content': c.get('text', ''), 'title': c.get('document', '')} for c in raw_chunks]

        total_latency += latency

        mrr = calculate_mrr(results, expected_kws)
        recall_3 = calculate_recall_at_k(results, expected_kws, k=3)
        precision_3 = calculate_precision_at_k(results, expected_kws, k=3)

        total_mrr += mrr
        total_recall_3 += recall_3
        total_precision_3 += precision_3

        print(f"     -> Latency: {latency:.3f}s | Retrieved: {len(results)} chunks | MRR: {mrr:.2f} | Recall@3: {recall_3:.2f} | P@3: {precision_3:.2f}")
        
        # Show top 3 results
        for rank, res in enumerate(results[:3], 1):
            text = res.get('text', res.get('content', ''))
            preview = text[:150].replace('\n', ' ')
            preview = preview.encode('ascii', errors='ignore').decode('ascii')
            print(f"       Rank {rank}: [{res['title']}] {preview}...")

        print("-" * 70)

    n = len(BENCHMARK_DATASET)
    avg_latency = total_latency / n
    avg_warm_latency = warm_latency_sum / (n - 1) if n > 1 else 0
    avg_mrr = total_mrr / n
    avg_recall_3 = total_recall_3 / n
    avg_precision_3 = total_precision_3 / n

    print("\n" + "=" * 70)
    print("BENCHMARK RESULTS SUMMARY")
    print("=" * 70)
    print(f"  Documents in ChromaDB        : (run inspect_db.py for live count)")
    print(f"  Queries evaluated            : {n}")
    print(f"  Cold Start Latency (Q1)      : {cold_latency:.3f}s")
    print(f"  Average Warm Latency         : {avg_warm_latency:.3f}s")
    print(f"  Overall Average Latency      : {avg_latency:.3f}s")
    print(f"  Mean Reciprocal Rank (MRR)   : {avg_mrr:.3f}")
    print(f"  Average Recall@3             : {avg_recall_3:.3f}")
    print(f"  Average Precision@3          : {avg_precision_3:.3f}")
    print("=" * 70)
    
    # Pass/Fail gate
    if avg_mrr >= 0.5 and avg_recall_3 >= 0.6:
        print("[PASS] Retrieval quality meets production threshold.")
    else:
        print(f"[BELOW THRESHOLD] MRR>=0.50, Recall@3>=0.60 required.")

if __name__ == "__main__":
    run_benchmark()
