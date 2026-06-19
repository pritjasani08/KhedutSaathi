from rag_system.src.query_engine import QueryEngine

# Single instance of QueryEngine to avoid re-initialization
_engine = None

def get_query_engine():
    global _engine

    if _engine is None:
        _engine = QueryEngine()

    return _engine

def process_query(question: str) -> str:
    engine = get_query_engine()
    return engine.query(question)