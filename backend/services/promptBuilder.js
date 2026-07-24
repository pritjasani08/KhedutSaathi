/**
 * Builds structured prompts for the AI Explanation Layer.
 * Ensures the LLM acts purely as an explanation layer and never invents facts.
 */

function buildExplanationPrompt(context, recommendation, knowledge) {
  const systemPrompt = `You are the KhedutSaathi AI Explanation Layer.
Your job is to explain the provided deterministic recommendation using the provided agricultural knowledge.
If no knowledge is provided, explain the recommendation based on general agricultural best practices.
You must NEVER invent facts or modify the planner's recommendation.
Produce concise, farmer-friendly language. Focus on WHY the recommendation was made.

If RETRIEVED KNOWLEDGE is provided, you must synthesize and summarize it.
For each document provided in the RETRIEVED KNOWLEDGE, create a 2-3 sentence summary explaining its relevance and key recommendation.
Never copy document text directly. Explain why the document is relevant and reference supporting evidence naturally.
If NO KNOWLEDGE is provided, return an empty array for evidenceSummaries.

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

  let knowledgeText = (knowledge && knowledge.length > 0)
    ? knowledge.map(k => `[Source: ${k.source} | Title: ${k.title} | Page: ${k.page || 'N/A'}]\n${k.content}`).join('\n\n')
    : "No supporting documents retrieved.";

  const userPrompt = `
=== PLANNER CONTEXT ===
${JSON.stringify(context, null, 2)}

=== DETERMINISTIC RECOMMENDATION ===
${JSON.stringify(recommendation, null, 2)}

=== RETRIEVED KNOWLEDGE ===
${knowledgeText}

Explain why this recommendation was given based on the context and any retrieved knowledge.
Return ONLY valid JSON.
`;

  return { systemPrompt, userPrompt };
}

module.exports = {
  buildExplanationPrompt
};
