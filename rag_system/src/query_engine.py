import logging
from src.retriever import Retriever
from src.gemini_client import GeminiClient
from src.config import RAG_CONFIDENCE_THRESHOLD

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class QueryEngine:
    def __init__(self):
        self.retriever = Retriever()
        self.llm = GeminiClient()

    def query(self, user_question: str) -> str:
        """
        End-to-end RAG pipeline:
        1.c Classify intent
        2. IF NON_AGRICULTURE -> Direct Gemini
        3. IF AGRICULTURE -> Vector Search
           - IF Score >= Threshold -> RAG + Gemini
           - ELSE -> Direct Gemini
        """
        logger.info(f"Processing query: {user_question}")
        
        # 1. Intent Classification
        intent = self.llm.classify_intent(user_question)
        logger.info(f"Classified Intent: {intent}")
        
        if intent == "NON_AGRICULTURE":
            logger.info("Using Direct Gemini (Non-Agriculture Intent).")
            return self.llm.generate_direct_answer(user_question)
            
        # 2. Vector Search
        context_chunks = self.retriever.retrieve(user_question)
        
        # Determine highest similarity score
        highest_similarity = 0.0
        if context_chunks:
            highest_similarity = max(chunk["similarity"] for chunk in context_chunks)
            
        logger.info(f"Highest retrieval similarity score: {highest_similarity:.4f}")
        logger.info(f"Confidence Threshold: {RAG_CONFIDENCE_THRESHOLD}")
        
        # 3. Check Confidence Threshold
        if highest_similarity >= RAG_CONFIDENCE_THRESHOLD:
            logger.info("Score >= Threshold. Using RAG + Gemini.")
            return self.llm.generate_rag_answer(user_question, context_chunks)
        else:
            logger.info("Score < Threshold. Using Direct Gemini.")
            return self.llm.generate_direct_answer(user_question)

if __name__ == "__main__":
    engine = QueryEngine()

    print("\nKhedutSaathi RAG Ready!")
    print("Type 'exit' to quit.\n")

    while True:
        question = input("Ask Question: ")

        if question.lower() == "exit":
            break

        answer = engine.query(question)

        print("\nAnswer:")
        print(answer)
        print("\n" + "="*60 + "\n")
