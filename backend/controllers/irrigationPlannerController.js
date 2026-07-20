const { getWeatherData } = require('../services/weatherService');
const { generateIrrigationPlan } = require('../services/irrigationPlannerService');
const { enrichWithKnowledge } = require('../services/knowledgeIntegrationService');
const { explainRecommendations } = require('../services/aiExplanationService');

async function getIrrigationPlan(req, res) {
  try {
    const { lat, lon, crop, state, district, soilType, farmArea, irrigationMethod, sowingDate } = req.body;

    if (!lat || !lon) {
      return res.status(400).json({ message: "Latitude and longitude are required." });
    }

    // Fetch weather data for the location
    const weatherData = await getWeatherData(lat, lon);

    // Generate the deterministic plan
    const config = {
      crop,
      state,
      district,
      soilType,
      farmArea,
      irrigationMethod,
      sowingDate
    };

    const plan = generateIrrigationPlan(config, weatherData);

    // Enrich recommendations with Knowledge Engine
    const { enrichedItems, metadata: knowledgeMetadata } = await enrichWithKnowledge(plan.recommendations);
    
    // Generate AI Explanations using Groq
    const plannerContext = { farm: plan.farm, season: plan.season, timeline: plan.timeline, weather: plan.weather };
    const { items: fullyEnrichedItems, metadata: aiMetadata } = await explainRecommendations(plannerContext, enrichedItems);

    plan.recommendations = fullyEnrichedItems;
    plan.knowledgeMetadata = knowledgeMetadata;
    plan.aiMetadata = aiMetadata;

    res.json(plan);
  } catch (error) {
    console.error("Irrigation Planner error:", error);
    res.status(500).json({ message: "Failed to generate irrigation plan" });
  }
}

module.exports = {
  getIrrigationPlan
};
