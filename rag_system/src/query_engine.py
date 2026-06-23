import logging
from rag_system.src.retriever import Retriever
from rag_system.src.gemini_client import GeminiClient
from rag_system.src.config import RAG_CONFIDENCE_THRESHOLD

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class QueryEngine:
    def __init__(self):
        self.retriever = Retriever()
        self.llm = GeminiClient()

    def query(self, user_question: str) -> str:
        """
        End-to-end RAG pipeline:
        1. Vector Search
           - IF Score >= Threshold -> RAG + Gemini
           - ELSE -> Direct Gemini
        """
        logger.info(f"Processing query: {user_question}")
        
        # 1. Vector Search
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
            rag_answer = self.llm.generate_rag_answer(user_question, context_chunks)
            
            # If the RAG prompt decided the context didn't actually contain the answer,
            # fallback to direct generation so the user still gets help.
            if "Information not available in the knowledge base" in rag_answer:
                logger.info("RAG context lacked the answer. Falling back to Direct Gemini.")
                return self.llm.generate_direct_answer(user_question)
                
            return rag_answer
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
