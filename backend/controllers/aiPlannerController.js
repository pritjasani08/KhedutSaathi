const axios = require('axios');
const crypto = require('crypto');
const logger = require('../utils/logger');
const weatherService = require('../services/weatherService');
const marketPriceService = require('../services/marketPriceService');
const farmerMemoryService = require('../services/farmerMemoryService');
const supabase = require('../config/supabaseClient');
const { resolveFarmerProfile, FarmerProfileNotFoundError } = require('../services/profileResolver');

const CROP_ML_URL = 'http://localhost:8003/predict';
const YIELD_ML_URL = 'http://127.0.0.1:8002/predict';
const PYTHON_AI_URL = 'http://localhost:8000/api/ai/planner-synthesis';

function calculateRiskLevel(weather, yieldPrediction) {
    let risk = "LOW";
    let score = 0;
    
    // Simplistic deterministic risk model
    if (weather && weather.current) {
        if (weather.current.rainProbability > 70) score += 2;
        if (weather.current.temperature > 35) score += 2;
    }
    
    if (yieldPrediction && yieldPrediction < 1.0) {
        score += 2; // Very low yield
    }
    
    if (score >= 4) risk = "HIGH";
    else if (score >= 2) risk = "MEDIUM";
    
    return risk;
}

exports.generatePlannerSynthesis = async (req, res) => {
    const startTime = performance.now();
    const requestId = req.headers['x-request-id'] || crypto.randomUUID();
    const userId = req.user.id;
    const logMeta = { requestId, farmerId: userId };
    
    const { 
        state, district, soilType, waterAvailability, 
        season, cropDuration, farmArea, irrigation, previousCrop 
    } = req.body;

    if (!state || !district || !soilType || !waterAvailability || !season || !farmArea) {
        return res.status(400).json({ error: "Missing required fields for AI Planner." });
    }

    try {
        // 1. Fetch Profile using central resolver
        let profile;
        try {
            const resolution = await resolveFarmerProfile(userId);
            profile = resolution.profile;
        } catch (err) {
            if (err instanceof FarmerProfileNotFoundError) {
                return res.status(404).json({ error: "Farmer profile not found. Please complete your profile." });
            }
            throw err;
        }
            
        // Strict contract: Controllers ALWAYS pass users.id
        const { memory, recentDecisions } = await farmerMemoryService.getFarmerMemory(userId);
        
        // 1. Crop Recommendation ML
        let recommendedCrops = [];
        try {
            const cropRes = await axios.post(CROP_ML_URL, {
                state, district, soil_type: soilType, 
                water_availability: waterAvailability, season, 
                crop_duration_months: Number(cropDuration) || 4
            }, { timeout: 10000 });
            recommendedCrops = cropRes.data?.recommended_crops || [];
        } catch (e) {
            logger.error('Crop ML Error', { ...logMeta, error: e.message });
            return res.status(500).json({ error: "Crop recommendation model unavailable." });
        }
        
        if (recommendedCrops.length === 0) {
             return res.status(400).json({ error: "No crops recommended for these parameters." });
        }
        
        const bestCrop = recommendedCrops[0];

        // 2. Yield Prediction ML (for best crop)
        let expectedYield = null;
        try {
            const yieldRes = await axios.post(YIELD_ML_URL, {
                state, district, crop: bestCrop, season,
                year: new Date().getFullYear(),
                area: Number(farmArea)
            }, { timeout: 10000 });
            expectedYield = Number(yieldRes.data?.predicted_yield);
        } catch (e) {
            logger.warn('Yield ML Error', { ...logMeta, error: e.message });
            // Don't fail the entire request, degrade gracefully
        }

        // 3. Weather Data
        let weatherData = null;
        try {
            weatherData = await weatherService.getWeatherByRegion(state, district);
        } catch (e) {
            logger.warn('Weather API Error', { ...logMeta, error: e.message });
        }

        // 4. Market Intelligence (for best crop)
        let marketData = null;
        try {
            const marketRes = await marketPriceService.fetchMarketPrices({ state, district, commodity: bestCrop });
            if (marketRes.records && marketRes.records.length > 0) {
                // Get the most recent relevant record
                marketData = marketRes.records[0];
            }
        } catch (e) {
            logger.warn('Market API Error', { ...logMeta, error: e.message });
        }

        // 5. Deterministic Risk
        const riskLevel = calculateRiskLevel(weatherData, expectedYield);

        const plannerContext = {
            requestId,
            farmInfo: { state, district, soilType, farmArea, irrigation, previousCrop },
            memory: memory,
            recent_decisions: recentDecisions,
            mlResults: {
                recommendedCrops,
                bestCrop,
                expectedYield,
                riskLevel
            },
            weather: weatherData,
            market: marketData
        };

        // 6. Python AI Engine Synthesis
        try {
            const aiRes = await axios.post(PYTHON_AI_URL, plannerContext, {
                headers: { 'Content-Type': 'application/json', 'X-Request-ID': requestId },
                timeout: 15000
            });
            
            const totalTime = performance.now() - startTime;
            logger.info('Planner AI Synthesis generated', { ...logMeta, totalTimeMs: Math.round(totalTime) });
            
            return res.status(200).json(aiRes.data);
            
        } catch (aiError) {
            const totalTime = performance.now() - startTime;
            logger.error('Python Planner AI Error', { ...logMeta, error: aiError.message, totalTimeMs: Math.round(totalTime) });
            
            // Graceful Fallback mapping to PlannerResponse schema
            const fallbackResponse = {
                status: "success",
                requestId: requestId,
                bestCrop: bestCrop,
                expectedYield: expectedYield,
                riskLevel: riskLevel,
                explanation: "The AI explanation engine is currently offline. Showing raw ML predictions.",
                actionPlan: [
                    "Proceed with " + bestCrop,
                    "Monitor local weather conditions",
                    "Check market prices manually"
                ],
                alternatives: recommendedCrops.slice(1, 4),
                sources: [
                    { name: "Crop Recommendation Model", type: "ML API", freshness: "Live" }
                ]
            };
            
            return res.status(200).json(fallbackResponse);
        }
        
    } catch (err) {
        logger.error('aiPlannerController outer error', { ...logMeta, error: err.message });
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
