from pydantic import BaseModel

class AskRequest(BaseModel):
    question: str

class AskResponse(BaseModel):
    success: bool
    answer: str | None = None
    error: str | None = None

class KnowledgeSearchRequest(BaseModel):
    query: str
    filters: dict | None = None
    crop: str | None = None
    topic: str | None = None

class KnowledgeSearchResponse(BaseModel):
    success: bool
    retrievedDocuments: list = []
    retrievedSections: list = []
    retrievedChunks: list = []
    citations: list = []
    error: str | None = None
