const axios = require('axios');
const { generateCropPlan } = require('../services/cropPlannerService');
const { enrichWithKnowledge } = require('../services/knowledgeIntegrationService');
const { explainRecommendations } = require('../services/aiExplanationService');
const eventBus = require('../utils/eventBus');
const { CROP_PLAN_GENERATED, buildEventPayload } = require('../constants/events');

const CROP_ML_URL = 'http://localhost:8003/predict';

async function getCropPlan(req, res) {
  try {
    const { state, district, soilType, season, farmArea, waterAvailability, preferredDuration } = req.body;

    if (!state || !district || !soilType || !season) {
      return res.status(400).json({ message: "State, district, soilType, and season are required." });
    }

    const farmConfig = {
      state,
      district,
      soilType,
      season,
      farmArea,
      waterAvailability,
      preferredDuration
    };


    
    const plan = generateCropPlan(farmConfig);

    
    // 2. Fetch ML Validation
    let mlValidation = null;
    try {
        let durationMonths = 4;
        if (preferredDuration === 'Short') durationMonths = 3;
        else if (preferredDuration === 'Medium') durationMonths = 6;
        else if (preferredDuration === 'Long') durationMonths = 9;
        
        const mlRes = await axios.post(CROP_ML_URL, {
            state, 
            district, 
            soil_type: soilType, 
            water_availability: waterAvailability, 
            season, 
            crop_duration_months: durationMonths
        }, { timeout: 8000 });
        
        const mlData = mlRes.data;
        if (mlData && mlData.ranking && mlData.ranking.length > 0) {
            const deterministicTop = plan.summary.bestCrop;
            const topMlCrop = mlData.ranking[0].crop;
            const isMatch = deterministicTop.toLowerCase() === topMlCrop.toLowerCase();
            const confidencePercentage = mlData.ranking[0].probability * 100;
            let confidenceLabel = 'Low';
            if (confidencePercentage >= 90) confidenceLabel = 'Very High';
            else if (confidencePercentage >= 75) confidenceLabel = 'High';
            else if (confidencePercentage >= 60) confidenceLabel = 'Moderate';
            
            let explanation = 'The deterministic planner prioritizes soil suitability, while the ML model favors historical yield patterns.';
            if (isMatch) {
                explanation = `Both the rule-based planner and ML model independently recommend ${deterministicTop} for these farm conditions.`;
            } else {
                console.warn(`[Crop Planner Consensus Disagreement] Inputs: ${JSON.stringify(farmConfig)} | Deterministic: ${deterministicTop} | ML: ${topMlCrop} | Confidence: ${confidencePercentage.toFixed(1)}%`);
            }
            
            mlValidation = {
                topDeterministicCrop: deterministicTop,
                topMlCrop: topMlCrop,
                agreement: isMatch,
                confidence: confidencePercentage,
                confidenceLabel,
                explanation,
                ranking: mlData.ranking.map(r => ({
                    crop: r.crop,
                    probability: r.probability * 100
                }))
            };
        }
    } catch (err) {
        console.warn("ML Model validation skipped (unavailable):", err.message);
    }

    plan.mlValidation = mlValidation;

    // 3. Enrich recommendations with Knowledge Engine
    const { enrichedItems, metadata: knowledgeMetadata } = await enrichWithKnowledge(plan.recommendations, { farm: req.body });
    
    // 4. Generate AI Explanations using Groq (passing ML validation as context!)
    const plannerContext = { farm: plan.farm, environment: plan.environment, summary: plan.summary, mlValidation: plan.mlValidation };
    const { items: fullyEnrichedItems, metadata: aiMetadata } = await explainRecommendations(plannerContext, enrichedItems);

    plan.recommendations = fullyEnrichedItems;
    plan.knowledgeMetadata = knowledgeMetadata;
    plan.aiMetadata = aiMetadata;

    // Contract Validation Layer
    const isValidPlan = plan && plan.recommendations && Array.isArray(plan.recommendations);
    if (!isValidPlan) {
      console.error("CRITICAL: Crop plan response contract violated.");
      return res.status(500).json({ message: "Internal Server Error: Malformed response from planner engine." });
    }
    
    // Ensure nested objects always contain the expected keys
    plan.recommendations.forEach((rec) => {
       if (!rec.actionableInsights) {
           rec.actionableInsights = [];
       }
       if (!rec.aiExplanation) {
           rec.aiExplanation = { text: null, grounded: false, confidence: 0 };
       }
    });

    if (req.user && req.user.id) {
        eventBus.emit(CROP_PLAN_GENERATED, buildEventPayload(CROP_PLAN_GENERATED, req.user.id, null, 'crop_planner', { crop: plan.summary.bestCrop }));
    }

    res.json(plan);
  } catch (error) {
    console.error("Crop Planner error:", error);
    res.status(500).json({ message: "Failed to generate crop plan" });
  }
}

module.exports = {
  getCropPlan
};
