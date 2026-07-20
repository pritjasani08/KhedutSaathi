const axios = require('axios');

const RAG_API_URL = process.env.RAG_API_URL || 'http://localhost:8001';

/**
 * Enriches a collection of items with knowledge retrieved from the RAG Knowledge Engine.
 * This service is generic and can be used by any KhedutSaathi module.
 * 
 * @param {Array} items - An array of objects. Each object may optionally have a `ragQuery` string.
 * @returns {Object} { enrichedItems, metadata }
 */
async function enrichWithKnowledge(items) {
  const startTime = Date.now();
  let totalDocumentsFound = 0;
  
  // Map over the items to create an array of promises
  const promises = items.map(async (item) => {
    // Deep clone to avoid mutating original
    const enrichedItem = { ...item };
    enrichedItem.knowledge = []; // Default to empty array

    if (enrichedItem.ragQuery) {
      try {
        console.log(`[TRACE] Calling Knowledge Service`);
        console.log(`URL: ${RAG_API_URL}/knowledge/search`);
        console.log(`PORT: ${new URL(RAG_API_URL).port || 'default'}`);
        
        const response = await axios.post(`${RAG_API_URL}/knowledge/search`, {
          query: enrichedItem.ragQuery,
          filters: {}, // Add any default filters if necessary
          crop: null, 
          topic: null
        }, {
          timeout: 5000 // 5-second timeout to prevent blocking the planner
        });

        if (response.data && response.data.success) {
          const chunks = response.data.retrievedChunks || [];
          totalDocumentsFound += chunks.length;

          console.log(`[TRACE] Knowledge Response Received\nStatus: ${response.status}\nKnowledge Count: ${chunks.length}`);

          // Normalize the raw RAG response into the Knowledge Object Schema
          enrichedItem.knowledge = chunks.map(chunk => ({
            title: chunk.document_title || 'Agricultural Document',
            source: chunk.source_organization || 'External Source',
            page: chunk.page_number || null,
            content: chunk.text || '',
            score: chunk.score || 0
          }));
        }
      } catch (error) {
        // We catch and log the error but do not throw, 
        // ensuring the fallback behavior is triggered gracefully.
        console.log(`[TRACE] Knowledge Response Error\nHTTP Status: ${error.response?.status}\nResponse Body: ${JSON.stringify(error.response?.data)}\nURL: ${error.config?.url}\nError: ${error.message}`);
        console.error(`Knowledge Engine Retrieval Error for query "${enrichedItem.ragQuery}":`, error.message);
      }
    }
    
    return enrichedItem;
  });

  // Use Promise.all to fetch concurrently
  const enrichedItems = await Promise.all(promises);
  
  const retrievalTimeMs = Date.now() - startTime;

  return {
    enrichedItems,
    metadata: {
      retrievalPerformed: true,
      documentsFound: totalDocumentsFound,
      retrievalTimeMs
    }
  };
}

module.exports = {
  enrichWithKnowledge
};
