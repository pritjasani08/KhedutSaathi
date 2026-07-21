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

  const deterministicEvidenceSummaries = knowledge.map(k => {
    // Strip injected context header if present (e.g. "Document: ... | Section: ...\n")
    let cleanContent = k.content || "";
    if (cleanContent.startsWith("Document:") && cleanContent.includes("\n")) {
      cleanContent = cleanContent.split("\n").slice(1).join("\n").trim();
    }
    
    // Extract first ~150 chars, but try to break at a sentence boundary or word boundary
    let summary = cleanContent.substring(0, 150);
    if (cleanContent.length > 150) {
        const lastPeriod = summary.lastIndexOf('.');
        if (lastPeriod > 50) {
            summary = summary.substring(0, lastPeriod + 1);
        } else {
            summary += "...";
        }
    }
    
    return {
      title: k.title,
      summary: summary || "No summary available.",
      keyRecommendation: "Refer to the original document for details.",
      source: k.source,
      page: k.page,
      score: k.score,
      diagnostics: k.diagnostics || {}
    };
  });

  const fallbackResponse = {
    explanation: {
      text: null,
      grounded: false,
      confidence: 0,
      model: MODEL,
      generatedAt: new Date().toISOString()
    },
    evidenceSummaries: deterministicEvidenceSummaries,
    metadata
  };

  if (!GROQ_API_KEY) {
    console.warn("Groq API key not configured. Skipping explanation generation.");
    return fallbackResponse;
  }

  if (!knowledge || knowledge.length === 0) {
    return { ...fallbackResponse, evidenceSummaries: [] };
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
        temperature: 0.1,
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // Increased timeout for summarization
      }
    );

    const contentStr = response.data.choices[0].message.content;
    
    let parsed;
    try {
      parsed = JSON.parse(contentStr);
    } catch (parseError) {
      console.error(`AI JSON Parse Error for ${recommendation.id}:`, parseError.message);
      return fallbackResponse; // Graceful deterministic fallback
    }

    metadata.explanationGenerated = true;
    
    // Safely extract explanation
    const explanationData = parsed.explanation || parsed;
    metadata.grounded = explanationData.grounded === true;
    metadata.generationTimeMs = Date.now() - startTime;

    // Safely extract and map evidenceSummaries
    let generatedSummaries = parsed.evidenceSummaries || [];
    if (!Array.isArray(generatedSummaries) || generatedSummaries.length === 0) {
      generatedSummaries = deterministicEvidenceSummaries; // Fallback if LLM didn't return them
    } else {
      // Map original scores and diagnostics back to the LLM summaries by finding matching sources/titles
      generatedSummaries = generatedSummaries.map(summary => {
        // Find closest matching knowledge chunk to inject the reranker score and diagnostics
        const match = knowledge.find(k => k.source === summary.source || k.title === summary.title);
        return {
          ...summary,
          score: match ? match.score : 0,
          diagnostics: match ? (match.diagnostics || {}) : {}
        };
      });
    }

    return {
      explanation: {
        text: explanationData.text || null,
        grounded: explanationData.grounded || false,
        confidence: explanationData.confidence || 0,
        model: MODEL,
        generatedAt: new Date().toISOString()
      },
      evidenceSummaries: generatedSummaries,
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
    
    // Preserve raw evidence for debugging and UI fallback "View Original Excerpt"
    enrichedItem.rawEvidence = enrichedItem.knowledge || [];
    
    if (enrichedItem.knowledge && enrichedItem.knowledge.length > 0) {
      const { explanation, evidenceSummaries, metadata } = await generateExplanation(context, enrichedItem, enrichedItem.knowledge);
      enrichedItem.aiExplanation = explanation;
      enrichedItem.evidenceSummaries = evidenceSummaries;
      
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
      enrichedItem.evidenceSummaries = [];
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
