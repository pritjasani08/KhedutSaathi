const { SCORING_WEIGHTS, CROP_DATABASE } = require('../config/cropPlannerConstants');

/**
 * Deterministic crop planning engine.
 * Calculates suitability scores for all crops based on farm configuration.
 */
function generateCropPlan(farmConfig) {
  const { state, district, soilType, season, farmArea, waterAvailability, preferredDuration } = farmConfig;

  // Normalize frontend soil string to canonical database representation
  const soilMap = {
    'Loamy Soil': 'Loamy',
    'Black Soil': 'Black Soil',
    'Clay Soil': 'Clayey',
    'Sandy Loam': 'Sandy Loam',
    'Clay Loam': 'Clay Loam',
    'Red Soil': 'Red Soil',
    'Sandy Soil': 'Sandy'
  };
  const normalizedSoil = soilMap[soilType] || soilType;

  // Score all crops in database
  const scoredCrops = CROP_DATABASE.map(crop => {
    let score = 0;

    // 1. Soil Match (Weight 35%)
    if (crop.suitableSoils.includes(normalizedSoil)) {
      score += 100 * SCORING_WEIGHTS.SOIL_MATCH;
    } else {
      // Partial points if somewhat compatible, but for now strict 0
    }

    // 2. Season Match (Weight 30%)
    if (crop.suitableSeasons.includes(season)) {
      score += 100 * SCORING_WEIGHTS.SEASON_MATCH;
    }

    // 3. Water Match (Weight 20%)
    if (waterAvailability === "High" || (waterAvailability === "Medium" && crop.waterRequirement !== "High") || (waterAvailability === "Low" && crop.waterRequirement === "Low")) {
      score += 100 * SCORING_WEIGHTS.WATER_MATCH;
    } else if (waterAvailability === "Medium" && crop.waterRequirement === "High") {
      score += 50 * SCORING_WEIGHTS.WATER_MATCH; // partial
    }

    // 4. Duration Match (Weight 15%)
    if (preferredDuration === "Short" && crop.growingDuration <= 110) {
      score += 100 * SCORING_WEIGHTS.DURATION_MATCH;
    } else if (preferredDuration === "Medium" && crop.growingDuration > 110 && crop.growingDuration <= 140) {
      score += 100 * SCORING_WEIGHTS.DURATION_MATCH;
    } else if (preferredDuration === "Long" && crop.growingDuration > 140) {
      score += 100 * SCORING_WEIGHTS.DURATION_MATCH;
    } else {
      score += 50 * SCORING_WEIGHTS.DURATION_MATCH; // partial for being slightly off
    }

    return {
      ...crop,
      score: Math.round(score),
      ragQuery: `${crop.name} cultivation guidelines ${state} ${soilType} soil`
    };
  });

  // Sort by score descending
  scoredCrops.sort((a, b) => b.score - a.score);

  // Top recommendation is the first one
  const topCrop = scoredCrops[0];

  return {
    farm: farmConfig,
    environment: {
      climate: topCrop.climateSuitability[0], // Simplified
      risk: topCrop.riskLevel
    },
    recommendations: [
      {
        id: `REC_${topCrop.id}`,
        title: `Cultivate ${topCrop.name}`,
        crop: topCrop.name,
        score: topCrop.score,
        waterRequirement: topCrop.waterRequirement,
        growingDuration: topCrop.growingDuration,
        risk: topCrop.riskLevel,
        ragQuery: topCrop.ragQuery,
        knowledge: [] // Will be populated by knowledgeIntegrationService
      }
    ],
    comparison: scoredCrops.map(c => ({
      crop: c.name,
      score: c.score,
      water: c.waterRequirement,
      duration: `${c.growingDuration} Days`,
      frequency: c.irrigationFrequency,
      climate: c.climateSuitability.join(', '),
      soil: c.suitableSoils.join(', '),
      risk: c.riskLevel,
      management: c.managementEffort
    })),
    timeline: topCrop.timeline, // Dynamic crop-specific timeline
    summary: {
      bestCrop: topCrop.name,
      confidence: topCrop.score >= 80 ? "High" : topCrop.score >= 60 ? "Medium" : "Low",
      nextAction: `Procure ${topCrop.name} seeds.`
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      engineVersion: "3.0"
    }
  };

  return response;
}

module.exports = {
  generateCropPlan
};
