/**
 * Deterministic agricultural configuration for the Crop Planner.
 * Acts as the single source of truth for crop planning rules and lifecycle data.
 */

const SCORING_WEIGHTS = {
  SOIL_MATCH: 0.35,
  SEASON_MATCH: 0.30,
  WATER_MATCH: 0.20,
  DURATION_MATCH: 0.15
};

const CROP_DATABASE = [
  {
    id: "CROP_GROUNDNUT",
    name: "Groundnut",
    suitableSoils: ["Loamy", "Sandy Loam", "Red Soil"],
    suitableSeasons: ["Kharif", "Summer"],
    waterRequirement: "Medium",
    irrigationFrequency: "10-15 Days",
    growingDuration: 120, // days
    climateSuitability: ["Semi-arid", "Sub-tropical"],
    riskLevel: "Low",
    managementEffort: "Medium",
    timeline: [
      { stage: "Planning", startDay: -15, endDay: 0, description: "Procure seeds, prepare field." },
      { stage: "Sowing", startDay: 0, endDay: 15, description: "Sow seeds at 5cm depth." },
      { stage: "Vegetative", startDay: 16, endDay: 40, description: "Apply first irrigation and weeding." },
      { stage: "Flowering & Pegging", startDay: 41, endDay: 80, description: "Critical moisture stage. Do not stress." },
      { stage: "Pod Development", startDay: 81, endDay: 105, description: "Ensure adequate moisture for pod filling." },
      { stage: "Harvest", startDay: 106, endDay: 120, description: "Harvest when leaves turn yellow." }
    ],
    defaultRagQuery: "Groundnut cultivation guidelines ICAR FAO"
  },
  {
    id: "CROP_COTTON",
    name: "Cotton",
    suitableSoils: ["Black Soil", "Clayey", "Loamy"],
    suitableSeasons: ["Kharif"],
    waterRequirement: "High",
    irrigationFrequency: "15-20 Days",
    growingDuration: 180,
    climateSuitability: ["Tropical", "Sub-tropical"],
    riskLevel: "Medium",
    managementEffort: "High",
    timeline: [
      { stage: "Planning", startDay: -20, endDay: 0, description: "Select Bt seeds, deep ploughing." },
      { stage: "Sowing", startDay: 0, endDay: 15, description: "Dibbling method." },
      { stage: "Vegetative", startDay: 16, endDay: 60, description: "Thinning and gap filling." },
      { stage: "Square Formation", startDay: 61, endDay: 90, description: "Critical stage. Pest monitoring." },
      { stage: "Boll Development", startDay: 91, endDay: 140, description: "Maintain soil moisture. Avoid waterlogging." },
      { stage: "Harvest", startDay: 141, endDay: 180, description: "Multiple pickings when bolls burst fully." }
    ],
    defaultRagQuery: "Cotton cultivation pest management ICAR"
  },
  {
    id: "CROP_WHEAT",
    name: "Wheat",
    suitableSoils: ["Loamy", "Clay Loam"],
    suitableSeasons: ["Rabi"],
    waterRequirement: "Medium",
    irrigationFrequency: "20-25 Days",
    growingDuration: 130,
    climateSuitability: ["Temperate", "Sub-tropical"],
    riskLevel: "Low",
    managementEffort: "Low",
    timeline: [
      { stage: "Planning", startDay: -15, endDay: 0, description: "Pre-sowing irrigation." },
      { stage: "Sowing", startDay: 0, endDay: 10, description: "Drilling or broadcasting." },
      { stage: "CRI Stage", startDay: 20, endDay: 25, description: "Crown Root Initiation. Most critical for irrigation." },
      { stage: "Tillering", startDay: 26, endDay: 45, description: "Second irrigation." },
      { stage: "Heading & Flowering", startDay: 70, endDay: 90, description: "Maintain moisture." },
      { stage: "Harvest", startDay: 120, endDay: 130, description: "Harvest when grains are hard." }
    ],
    defaultRagQuery: "Wheat cultivation irrigation schedule ICAR"
  },
  {
    id: "CROP_MAIZE",
    name: "Maize",
    suitableSoils: ["Loamy", "Sandy Loam", "Clay Loam"],
    suitableSeasons: ["Kharif", "Rabi"],
    waterRequirement: "Medium",
    irrigationFrequency: "10-12 Days",
    growingDuration: 110,
    climateSuitability: ["Tropical", "Sub-tropical"],
    riskLevel: "Low",
    managementEffort: "Medium",
    timeline: [
      { stage: "Planning", startDay: -10, endDay: 0, description: "Prepare seedbed." },
      { stage: "Sowing", startDay: 0, endDay: 10, description: "Line sowing." },
      { stage: "Vegetative", startDay: 11, endDay: 45, description: "Weed control." },
      { stage: "Tasseling & Silking", startDay: 46, endDay: 65, description: "Critical moisture stage." },
      { stage: "Grain Filling", startDay: 66, endDay: 95, description: "Ensure adequate water." },
      { stage: "Harvest", startDay: 96, endDay: 110, description: "Harvest when husks turn dry." }
    ],
    defaultRagQuery: "Maize cultivation guidelines ICAR"
  }
];

module.exports = {
  SCORING_WEIGHTS,
  CROP_DATABASE
};
