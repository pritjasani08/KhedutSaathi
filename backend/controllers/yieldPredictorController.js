const { getPredictedYield } = require('../services/yieldPredictionService');
const { enrichWithKnowledge } = require('../services/knowledgeIntegrationService');
const { explainRecommendations } = require('../services/aiExplanationService');

async function getYieldPrediction(req, res) {
  try {
    const { state, district, crop, season, area, year, soilType } = req.body;

    if (!state || !district || !crop || !season || !area) {
      return res.status(400).json({ message: "State, district, crop, season, and area are required." });
    }

    const farmConfig = {
      state,
      district,
      crop,
      season,
      area: parseFloat(area),
      year: parseInt(year) || new Date().getFullYear(),
      soilType
    };

    // 1. Generate ML-based Prediction (abstracted)
    const result = await getPredictedYield(farmConfig);

    // 2. Enrich recommendations with Knowledge Engine
    const { enrichedItems, metadata: knowledgeMetadata } = await enrichWithKnowledge(result.recommendations);
    
    // 3. Generate AI Explanations using Groq
    const plannerContext = { 
        farm: farmConfig, 
        prediction: result.prediction, 
        analysis: result.analysis 
    };
    const { items: fullyEnrichedItems, metadata: aiMetadata } = await explainRecommendations(plannerContext, enrichedItems);

    // 4. Assemble final response adhering to shared contract
    const finalResponse = {
        farm: farmConfig,
        environment: {
            climate: result.analysis.weatherSensitivity === "High" ? "Sensitive" : "Stable",
            risk: result.prediction.category === "Low Yield" ? "High" : "Low"
        },
        prediction: result.prediction,
        analysis: result.analysis,
        recommendations: fullyEnrichedItems,
        summary: {
            predictedYield: result.prediction.totalYield,
            category: result.prediction.category,
            confidence: result.prediction.confidence
        },
        metadata: {
            generatedAt: new Date().toISOString(),
            engineVersion: "3.0",
            knowledgeRetrieval: knowledgeMetadata,
            aiExplanation: aiMetadata
        }
    };

    res.json(finalResponse);
  } catch (error) {
    console.error("Yield Predictor error:", error);
    res.status(500).json({ message: "Failed to generate yield prediction" });
  }
}

module.exports = {
  getYieldPrediction
};
