const axios = require('axios');
const { buildExplanationPrompt } = require('./promptBuilder');

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.1-8b-instant'; // Using newer model for explanations

/**
 * Generates an AI Explanation for a recommendation using Groq.
 * @param {Object} context - The planner's deterministic context.
 * @param {Object} recommendation - The recommendation object.
 * @param {Array} knowledge - The array of normalized knowledge objects retrieved from RAG.
 * @returns {Object} { explanation, metadata }
 */
async function generateExplanation(context, recommendation, knowledge) {

  
  const startTime = Date.now();
  let metadata = {
    explanationGenerated: false,
    model: MODEL,
    generationTimeMs: 0,
    grounded: false
  };

  const fallbackResponse = {
    explanation: {
      text: null,
      grounded: false,
      confidence: 0,
      model: MODEL,
      generatedAt: new Date().toISOString()
    },
    metadata
  };

  if (!GROQ_API_KEY) {

    console.warn("Groq API key not configured. Skipping explanation generation.");
    return fallbackResponse;
  }

  // If no knowledge was retrieved, do not attempt to generate an explanation.
  if (!knowledge || knowledge.length === 0) {

    return fallbackResponse;
  }

  try {
    const { systemPrompt, userPrompt } = buildExplanationPrompt(context, recommendation, knowledge);



    const response = await axios.post(
      GROQ_API_URL,
      {
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1, // Keep it deterministic and factual
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 8000 // Ensure we don't block the planner for too long
      }
    );



    const contentStr = response.data.choices[0].message.content;
    const parsed = JSON.parse(contentStr);

    metadata.explanationGenerated = true;
    metadata.grounded = parsed.grounded === true;
    metadata.generationTimeMs = Date.now() - startTime;

    return {
      explanation: {
        text: parsed.text || null,
        grounded: parsed.grounded || false,
        confidence: parsed.confidence || 0,
        model: MODEL,
        generatedAt: new Date().toISOString()
      },
      metadata
    };

  } catch (error) {

    console.error(`AI Explanation error for ${recommendation.id}:`, error.message);
    metadata.generationTimeMs = Date.now() - startTime;
    return fallbackResponse;
  }
}

/**
 * Enriches a collection of recommendations with AI explanations.
 * @param {Object} context - The planner's deterministic context.
 * @param {Array} enrichedItems - The items already enriched with knowledge.
 * @returns {Object} { items, metadata }
 */
async function explainRecommendations(context, enrichedItems) {
  let totalGenerationTimeMs = 0;
  let totalExplanationsGenerated = 0;

  const promises = enrichedItems.map(async (item) => {
    const enrichedItem = { ...item };
    
    // Only generate explanation if it has knowledge
    if (enrichedItem.knowledge && enrichedItem.knowledge.length > 0) {
      const { explanation, metadata } = await generateExplanation(context, enrichedItem, enrichedItem.knowledge);
      enrichedItem.aiExplanation = explanation;
      totalGenerationTimeMs += metadata.generationTimeMs;
      if (metadata.explanationGenerated) totalExplanationsGenerated++;
    } else {
      enrichedItem.aiExplanation = {
        text: null,
        grounded: false,
        confidence: 0,
        model: MODEL,
        generatedAt: new Date().toISOString()
      };
    }
    return enrichedItem;
  });

  const finalItems = await Promise.all(promises);

  return {
    items: finalItems,
    metadata: {
      explanationsGenerated: totalExplanationsGenerated,
      totalGenerationTimeMs
    }
  };
}

module.exports = {
  generateExplanation,
  explainRecommendations
};
