import logging
from rag_system.src.gemini_manager import GeminiManager
from rag_system.src.response_formatter import clean_response

logger = logging.getLogger(__name__)

class GeminiClient:
    def __init__(self):
        self.manager = GeminiManager()

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
2. Provide a clear, structured, and concise answer.
3. Use bullet points (-) for readability instead of long paragraphs. Keep it short.
4. If the answer cannot be found in the context, respond EXACTLY with: "Information not available in the knowledge base."
5. Do NOT mention that you are reading from "chunks", "context", "documents", or a "vector database". 
6. You MUST answer in the SAME language as the user's question (Gujarati, Hindi, or English).

Knowledge Base Context:
{context_text}

User Question: {query}
"""
        try:
            logger.info("Sending RAG prompt to Gemini API...")
            response = self.manager.execute_with_fallback(prompt)
            return clean_response(response.text.strip())
        except Exception as e:
            logger.error(f"Error generating RAG answer with Gemini: {e}")
            if "429" in str(e).lower() or "quota" in str(e).lower() or "exhausted" in str(e).lower():
                return "AI service is temporarily unavailable. Please try again later."
            return "Error: Could not generate answer at this time."

    def generate_direct_answer(self, query: str) -> str:
        """Generates an answer directly using Gemini without context."""
        prompt = f"""
You are an expert agriculture assistant for the KhedutSaathi platform.
Your task is to answer the user's question, but ONLY if it is related to agriculture, farming, crops, livestock, weather, or rural development.

CRITICAL INSTRUCTIONS:
1. Provide a clear, structured, and concise point-wise answer. 
2. Use bullet points (-) instead of long paragraphs. Keep it short.
3. If the user's question is NOT related to agriculture or farming, decline to answer politely. You must say: "I am an agricultural assistant and can only answer questions related to farming." (Translate this phrase to the user's language if they are speaking Gujarati or Hindi).
4. You MUST answer in the SAME language as the user's question (Gujarati, Hindi, or English).

User Question: {query}
"""
        try:
            logger.info("Sending direct prompt to Gemini API...")
            response = self.manager.execute_with_fallback(prompt)
            return clean_response(response.text.strip())
        except Exception as e:
            logger.error(f"Error generating direct answer with Gemini: {e}")
            if "429" in str(e).lower() or "quota" in str(e).lower() or "exhausted" in str(e).lower():
                return "AI service is temporarily unavailable. Please try again later."
            return "Error: Could not generate answer at this time."
