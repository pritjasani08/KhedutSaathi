class AIEngineError(Exception):
    """Base exception for all AI Engine errors."""
    pass

class ContextError(AIEngineError):
    """Raised when the incoming FarmContext is malformed or missing critical data."""
    pass

class ValidationError(AIEngineError):
    """Raised when the generated LLM response violates schema or constraints."""
    pass

class GroqError(AIEngineError):
    """Raised when Groq API fails or times out."""
    pass

class RAGError(AIEngineError):
    """Raised when RAG retrieval fails."""
    pass

class TimeoutError(AIEngineError):
    """Raised when an operation exceeds its time limit."""
    pass

class AuthenticationError(AIEngineError):
    """Raised when unauthorized access is attempted."""
    pass
