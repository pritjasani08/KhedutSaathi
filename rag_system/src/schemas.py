from pydantic import BaseModel

class AskRequest(BaseModel):
    question: str

class AskResponse(BaseModel):
    success: bool
    answer: str | None = None
    error: str | None = None
