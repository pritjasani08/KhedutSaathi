import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load env variables from KhedutSaathi/.env
dotenv_path = os.path.join(
    os.path.dirname(__file__),
    "..",
    "..",
    ".env"
)
load_dotenv(dotenv_path)

# FIXED IMPORTS
from rag_system.src.schemas import AskRequest, AskResponse, KnowledgeSearchRequest, KnowledgeSearchResponse
from rag_system.src.api_utils import process_query
from rag_system.src.knowledge_engine.retriever import KnowledgeRetriever

retriever = KnowledgeRetriever()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="KhedutSaathi RAG API")

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "status": "running",
        "service": "KhedutSaathi RAG API"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }

@app.post("/ask", response_model=AskResponse)
def ask_question(request: AskRequest):
    if not request.question or not request.question.strip():
        return AskResponse(
            success=False,
            error="Question cannot be empty."
        )

    try:
        logger.info(f"API received question: {request.question}")

        answer = process_query(request.question)

        return AskResponse(
            success=True,
            answer=answer
        )

    except Exception as e:
        logger.exception("Error processing query")

        return AskResponse(
            success=False,
            error=str(e)
        )

@app.post("/knowledge/search", response_model=KnowledgeSearchResponse)
def knowledge_search(request: KnowledgeSearchRequest):
    if not request.query or not request.query.strip():
        return KnowledgeSearchResponse(success=False, error="Query cannot be empty.")
        
    try:
        logger.info(f"Knowledge API received query: {request.query}")
        
        results = retriever.search(
            query=request.query,
            filters=request.filters,
            crop=request.crop,
            topic=request.topic
        )
        
        return KnowledgeSearchResponse(
            success=True,
            retrievedDocuments=results.get("retrievedDocuments", []),
            retrievedSections=results.get("retrievedSections", []),
            retrievedChunks=results.get("retrievedChunks", []),
            citations=results.get("citations", [])
        )
        
    except Exception as e:
        logger.exception("Error processing knowledge search")
        return KnowledgeSearchResponse(success=False, error=str(e))