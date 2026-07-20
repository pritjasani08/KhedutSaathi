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
Your response MUST be valid JSON matching this schema exactly:
{
  "text": "string",
  "grounded": "boolean",
  "confidence": "number (0-1)"
}`;

  let knowledgeText = knowledge.map(k => `[Source: ${k.source} | Title: ${k.title}]\n${k.content}`).join('\n\n');

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
