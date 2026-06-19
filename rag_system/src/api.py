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
from rag_system.src.schemas import AskRequest, AskResponse
from rag_system.src.api_utils import process_query

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
    allow_origins=origins,
    allow_credentials=True,
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