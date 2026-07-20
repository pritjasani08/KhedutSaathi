const knowledgeRetrievalService = require('../services/knowledgeRetrievalService');

const searchKnowledge = async (req, res) => {
    try {
        const { query, filters, crop, topic } = req.body;

        if (!query) {
            return res.status(400).json({
                success: false,
                error: 'Query is required.'
            });
        }

        const results = await knowledgeRetrievalService.searchKnowledge({
            query,
            filters,
            crop,
            topic
        });

        if (!results.success) {
            return res.status(500).json({
                success: false,
                error: results.error || 'Failed to retrieve knowledge from engine.'
            });
        }

        res.status(200).json({
            success: true,
            retrievedDocuments: results.retrievedDocuments,
            retrievedSections: results.retrievedSections,
            retrievedChunks: results.retrievedChunks,
            citations: results.citations
        });
    } catch (error) {
        console.error('Knowledge Search Controller Error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error while searching knowledge.'
        });
    }
};

module.exports = {
    searchKnowledge
};
