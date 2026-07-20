const axios = require('axios');

class KnowledgeRetrievalService {
    constructor() {
        this.ragApiUrl = process.env.RAG_API_URL || 'http://127.0.0.1:8001';
    }

    async searchKnowledge({ query, filters, crop, topic }) {
        try {
            const response = await axios.post(`${this.ragApiUrl}/knowledge/search`, {
                query,
                filters,
                crop,
                topic
            });
            
            return response.data;
        } catch (error) {
            console.error('Error communicating with Knowledge Python Engine:', error.message);
            throw new Error('Failed to retrieve knowledge from the engine.');
        }
    }
}

module.exports = new KnowledgeRetrievalService();
