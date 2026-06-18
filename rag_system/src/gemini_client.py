import logging
import google.generativeai as genai
from src.config import GEMINI_API_KEY, GEMINI_MODEL

logger = logging.getLogger(__name__)

class GeminiClient:
    def __init__(self):
        if not GEMINI_API_KEY:
            logger.error("GEMINI_API_KEY is not set in project root .env file.")
            raise ValueError("Missing GEMINI_API_KEY in project root .env")
            
        genai.configure(api_key=GEMINI_API_KEY)
        self.model = genai.GenerativeModel(GEMINI_MODEL)

    def classify_intent(self, query: str) -> str:
        """Classifies if the query is AGRICULTURE or NON_AGRICULTURE."""
        prompt = f"""
Classify the following user query into one of two categories: 'AGRICULTURE' or 'NON_AGRICULTURE'.
Respond with EXACTLY ONE WORD (the category name), nothing else.

Examples:
"કપાસમાં યુરિયા ક્યારે આપવી?" -> AGRICULTURE
"Who is Narendra Modi?" -> NON_AGRICULTURE
"What is Python?" -> NON_AGRICULTURE
"ટામેટામાં બ્લાઇટનું નિયંત્રણ કેવી રીતે કરવું?" -> AGRICULTURE

Query: "{query}"
"""
        try:
            logger.info("Classifying query intent...")
            response = self.model.generate_content(prompt)
            result = response.text.strip().upper()
            if "NON_AGRICULTURE" in result:
                return "NON_AGRICULTURE"
            elif "AGRICULTURE" in result:
                return "AGRICULTURE"
            return "NON_AGRICULTURE"
        except Exception as e:
            logger.error(f"Error classifying intent: {e}")
            return "AGRICULTURE"  # Safe fallback

    def generate_rag_answer(self, query: str, context_chunks: list) -> str:
        """Generates an answer using Gemini based on the retrieved context."""
        if not context_chunks:
            return "Information not available in the knowledge base."

        context_text = "\n\n".join([f"Context: {c['content']}" for c in context_chunks])
        
        prompt = f"""
You are an expert agriculture assistant for the KhedutSaathi platform.
Your task is to answer the user's question based strictly on the provided knowledge base context.

CRITICAL INSTRUCTIONS:
1. Use the provided context to answer the question.
2. If the answer cannot be found in the context, respond EXACTLY with: "Information not available in the knowledge base."
3. Do NOT mention that you are reading from "chunks", "context", "documents", or a "vector database". 
4. Provide a natural, conversational answer.
5. You MUST answer in the SAME language as the user's question (Gujarati, Hindi, or English).

Knowledge Base Context:
{context_text}

User Question: {query}
"""
        try:
            logger.info("Sending RAG prompt to Gemini API...")
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"Error generating RAG answer with Gemini: {e}")
            return "Error: Could not generate answer at this time."

    def generate_direct_answer(self, query: str) -> str:
        """Generates an answer directly using Gemini without context."""
        prompt = f"""
You are an expert assistant for the KhedutSaathi platform.
Please answer the user's question naturally and conversationally.
You MUST answer in the SAME language as the user's question (Gujarati, Hindi, or English).

User Question: {query}
"""
        try:
            logger.info("Sending direct prompt to Gemini API...")
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"Error generating direct answer with Gemini: {e}")
            return "Error: Could not generate answer at this time."
