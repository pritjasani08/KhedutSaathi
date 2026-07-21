/**
 * Builds structured prompts for the AI Explanation Layer.
 * Ensures the LLM acts purely as an explanation layer and never invents facts.
 */

function buildExplanationPrompt(context, recommendation, knowledge) {
  const systemPrompt = `You are the KhedutSaathi AI Explanation Layer.
Your ONLY job is to explain the provided deterministic recommendation using ONLY the provided agricultural knowledge.
You must NEVER invent facts, modify the planner's recommendation, or recommend actions outside the retrieved knowledge.
Produce concise, farmer-friendly language. Focus on WHY the recommendation was made.
If the supporting knowledge is insufficient, mention the uncertainty.

Additionally, you must synthesize and summarize the retrieved knowledge.
For each document provided in the RETRIEVED KNOWLEDGE, create a 2-3 sentence summary explaining its relevance and key recommendation.
Never copy document text directly. Explain why the document is relevant and reference supporting evidence naturally.
If evidence conflicts, mention the conflict.

Your response MUST be valid JSON matching this schema exactly:
{
  "explanation": {
    "text": "string",
    "grounded": "boolean",
    "confidence": "number (0-1)"
  },
  "evidenceSummaries": [
    {
      "title": "string (Document Title)",
      "summary": "string (2-3 sentences)",
      "keyRecommendation": "string",
      "source": "string (Institution/Source)",
      "page": "number | null"
    }
  ]
}`;

  let knowledgeText = knowledge.map(k => `[Source: ${k.source} | Title: ${k.title} | Page: ${k.page || 'N/A'}]\n${k.content}`).join('\n\n');

  const userPrompt = `
=== PLANNER CONTEXT ===
${JSON.stringify(context, null, 2)}

=== DETERMINISTIC RECOMMENDATION ===
${JSON.stringify(recommendation, null, 2)}

=== RETRIEVED KNOWLEDGE ===
${knowledgeText}

Based ONLY on the retrieved knowledge above, explain why this recommendation was given.
Return ONLY valid JSON.
`;

  return { systemPrompt, userPrompt };
}

module.exports = {
  buildExplanationPrompt
};
