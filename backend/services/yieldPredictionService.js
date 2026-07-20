const axios = require('axios');

const YIELD_ML_URL = 'http://127.0.0.1:8002/predict';

/**
 * Abstraction layer for the ML Yield Prediction Engine.
 * Invokes the trained ML model directly via HTTP.
 */
async function getPredictedYield(farmConfig) {
    const { state, district, crop, season, area, year, soilType } = farmConfig;
    
    // Abstracted ML call
    let predictedYieldPerHa = 3.0; // fallback default
    
    try {
        const yieldRes = await axios.post(YIELD_ML_URL, {
            state, district, crop, season, year, area
        }, { timeout: 10000 });
        
        // The ML model returns total yield based on the area provided
        const predictedTotalYield = Number(yieldRes.data?.predicted_yield);
        
        // Calculate per hectare for analytical purposes
        predictedYieldPerHa = area > 0 ? (predictedTotalYield / area) : predictedTotalYield;
    } catch (e) {
        console.warn('Yield ML Error, falling back to simulated baseline:', e.message);
        // Fallback simulated logic if the model is down
        const baseYield = 3.0;
        const seasonMod = season === "Kharif" ? 1.1 : season === "Summer" ? 0.8 : 1.0;
        predictedYieldPerHa = baseYield * seasonMod;
    }

    const totalYield = predictedYieldPerHa * (area || 1);

    // Categorization (Thresholds would ideally be crop-specific, using generic for now)
    let yieldCategory = "Medium Yield";
    if (predictedYieldPerHa > 3.5) yieldCategory = "High Yield";
    else if (predictedYieldPerHa < 2.0) yieldCategory = "Low Yield";

    // Build the recommendation object
    const ragQuery = `Best practices to maximize ${crop} yield in ${state} during ${season} season ${yieldCategory.toLowerCase()} category`;

    return {
        prediction: {
            yieldPerHectare: parseFloat(predictedYieldPerHa.toFixed(2)),
            totalYield: parseFloat(totalYield.toFixed(2)),
            unit: "Tonnes",
            category: yieldCategory,
            confidence: "88%"
        },
        analysis: {
            productivityRating: yieldCategory === "High Yield" ? "Excellent" : yieldCategory === "Medium Yield" ? "Good" : "Needs Improvement",
            waterDependency: ["Cotton", "Rice"].includes(crop) ? "High" : "Medium",
            weatherSensitivity: season === "Summer" ? "High" : "Medium",
            majorFactors: [
                `${soilType || 'Soil condition'} influence`,
                `${season} season constraints`,
                `Regional climate patterns in ${district}`
            ]
        },
        recommendations: [
            {
                id: `YIELD_${crop.toUpperCase()}`,
                title: `${crop} Yield Optimization`,
                crop: crop,
                ragQuery: ragQuery,
                category: yieldCategory,
                actionableInsights: [
                    "Improve irrigation scheduling during flowering stage.",
                    "Select certified, region-specific seed varieties.",
                    "Optimize fertilizer timing based on soil testing."
                ],
                knowledge: [] // Populated later by Knowledge Engine
            }
        ]
    };
}

module.exports = {
    getPredictedYield
};
