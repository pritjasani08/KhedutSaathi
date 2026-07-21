const {
  CROP_STAGES,
  DEFAULT_CROP_STAGES,
  METHOD_EFFICIENCIES,
  BASE_WATER_REQUIREMENT_LITERS_PER_ACRE,
  SOIL_RETENTION_FACTORS
} = require('../config/irrigationConstants');

/**
 * Deterministic service to calculate the irrigation plan
 */
function generateIrrigationPlan(config, weatherData) {
  const {
    crop = 'Cotton',
    state = 'Gujarat',
    district = 'Rajkot',
    soilType = 'Loamy',
    farmArea = 1,
    irrigationMethod = 'Drip',
    sowingDate = new Date().toISOString()
  } = config;

  // 1. Calculate Timeline & Stage
  const stages = CROP_STAGES[crop] || DEFAULT_CROP_STAGES;
  let totalSeasonDays = stages.reduce((acc, stage) => acc + stage.durationDays, 0);
  
  const sowDateObj = new Date(sowingDate);
  const today = new Date();
  const diffTime = Math.abs(today - sowDateObj);
  let currentDay = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (currentDay < 0) currentDay = 0;
  if (currentDay > totalSeasonDays) currentDay = totalSeasonDays;

  let currentStage = stages[stages.length - 1];
  let daysAccumulated = 0;
  for (const stage of stages) {
    daysAccumulated += stage.durationDays;
    if (currentDay <= daysAccumulated) {
      currentStage = stage;
      break;
    }
  }

  const progress = Math.min(100, Math.round((currentDay / totalSeasonDays) * 100));

  // 2. Seasonal Calculation
  const baseWaterLitersPerAcre = BASE_WATER_REQUIREMENT_LITERS_PER_ACRE[crop] || BASE_WATER_REQUIREMENT_LITERS_PER_ACRE['Default'];
  
  // 1 Hectare = 2.47105 Acres
  const farmAreaAcres = farmArea * 2.47105;
  const soilFactor = SOIL_RETENTION_FACTORS[soilType] || SOIL_RETENTION_FACTORS['Default'];
  
  // Required volume in Liters for 100% efficiency
  const idealVolumeLiters = baseWaterLitersPerAcre * farmAreaAcres * soilFactor;
  
  const efficiency = METHOD_EFFICIENCIES[irrigationMethod] || METHOD_EFFICIENCIES['Default'];
  const defaultEfficiency = METHOD_EFFICIENCIES['Flood'] || 0.50; // Baseline for water saved comparison
  
  // Total water required taking into account efficiency
  const totalVolumeLiters = Math.round(idealVolumeLiters / efficiency);
  const baselineVolumeLiters = Math.round(idealVolumeLiters / defaultEfficiency);
  
  // Water saved compared to traditional flood irrigation
  const waterSavedLiters = Math.max(0, baselineVolumeLiters - totalVolumeLiters);
  
  // 1 mm of water depth over 1 Hectare = 10,000 Liters
  // Depth (mm) = Total Liters / (farmAreaInHectares * 10,000)
  // Ensure we don't divide by zero if farmArea is 0
  const safeArea = farmArea > 0 ? farmArea : 1;
  const depthMm = Math.round(totalVolumeLiters / (safeArea * 10000));
  
  const rainContributionMm = Math.round(depthMm * 0.15); // Simple estimate: 15% from rain
  const rainContributionLiters = Math.round(totalVolumeLiters * 0.15);
  
  const irrigationRequiredMm = Math.max(0, depthMm - rainContributionMm);
  const irrigationRequiredLiters = Math.max(0, totalVolumeLiters - rainContributionLiters);
  
  // Estimated irrigations depending on method and soil
  let baseIrrigations = 15;
  if (irrigationMethod === 'Drip') baseIrrigations = 30;
  if (irrigationMethod === 'Flood') baseIrrigations = 10;
  if (soilType === 'Sandy') baseIrrigations = Math.round(baseIrrigations * 1.5);
  
  const irrigationCount = baseIrrigations;
  const waterPerIrrigationMm = Math.round(irrigationRequiredMm / irrigationCount);
  const waterPerIrrigationLiters = Math.round(irrigationRequiredLiters / irrigationCount);

  // Parse weather for expected rain and alerts
  let rainProbToday = 0;
  let currentTemp = 25;
  let currentWind = 10;
  let humidity = 60;
  
  if (weatherData && weatherData.current) {
    currentTemp = Math.round(weatherData.current.temperature);
    currentWind = Math.round(weatherData.current.windSpeed);
    if (weatherData.current.relative_humidity_2m !== undefined) {
      humidity = Math.round(weatherData.current.relative_humidity_2m);
    }
  }
  
  if (weatherData && weatherData.daily && weatherData.daily.precipitation_probability_max) {
     rainProbToday = weatherData.daily.precipitation_probability_max[0];
  } else if (weatherData && weatherData.hourly && weatherData.hourly.precipitation_probability) {
     rainProbToday = weatherData.hourly.precipitation_probability[0];
  }

  // 3. Weather Intelligence
  const heatwave = currentTemp > 35;
  const rainfallAlert = rainProbToday >= 60;
  const windAlert = currentWind > 25;

  // Calculate Next Irrigation Date (rule-based mock)
  const nextIrrigationDate = new Date();
  if (rainfallAlert) {
    nextIrrigationDate.setDate(nextIrrigationDate.getDate() + 3); // Postpone
  } else if (heatwave) {
    nextIrrigationDate.setDate(nextIrrigationDate.getDate() + 0); 
  } else {
    nextIrrigationDate.setDate(nextIrrigationDate.getDate() + 1);
  }

  // 4. Recommendation Engine
  const recommendations = [];

  if (heatwave) {
    recommendations.push({
      id: `REC_HEATWAVE_${irrigationMethod.toUpperCase()}`,
      title: "Heatwave Detected",
      category: "weather",
      severity: "warning",
      ragQuery: `Best ${irrigationMethod} irrigation practices during heatwave for ${crop} ${currentStage.name} stage`,
      actionableInsights: [
        "Increase irrigation frequency or duration to combat enhanced soil evaporation.",
        "Consider applying mulch to retain soil moisture around the plant roots.",
        "Avoid irrigating during peak sun hours to minimize evaporation losses."
      ]
    });
  }

  if (rainfallAlert) {
    recommendations.push({
      id: `REC_RAIN_DELAY`,
      title: "Heavy Rainfall Expected",
      category: "weather",
      severity: "info",
      ragQuery: `How to manage soil drainage for ${crop} during heavy rainfall in ${currentStage.name} stage`,
      actionableInsights: [
        "Delay scheduled irrigation to prevent waterlogging and root rot.",
        "Ensure field drainage channels are clear of debris.",
        "Monitor for fungal diseases which thrive in high humidity after rain."
      ]
    });
  }

  if (windAlert && irrigationMethod === 'Sprinkler') {
    recommendations.push({
      id: `REC_WIND_SPRINKLER`,
      title: "High Wind Alert",
      category: "weather",
      severity: "warning",
      ragQuery: `Managing sprinkler irrigation efficiency during high winds for ${crop}`,
      actionableInsights: [
        "Pause sprinkler operations until wind speeds subside below 15 km/h.",
        "Wind drift significantly reduces water distribution uniformity.",
        "If irrigation is critical, switch to drip irrigation if available."
      ]
    });
  }
  
  // Stage specific recommendation
  recommendations.push({
    id: `REC_STAGE_${currentStage.name.replace(/\s+/g, '').toUpperCase()}`,
    title: `${currentStage.name} Stage Guidelines`,
    category: "cropStage",
    severity: "info",
    ragQuery: `Water management and fertilization for ${crop} during ${currentStage.name} stage`,
    actionableInsights: []
  });

  // 5. Summary
  let nextAction = "Proceed with scheduled irrigation";
  let overallStatus = "Good";
  
  if (rainfallAlert) {
    nextAction = "Delay irrigation due to expected rainfall";
    overallStatus = "Monitor";
  } else if (heatwave) {
    nextAction = "Increase irrigation frequency or volume to prevent heat stress";
    overallStatus = "Action Required";
  } else if (windAlert && irrigationMethod === 'Sprinkler') {
    nextAction = "Avoid using sprinklers until wind subsides";
    overallStatus = "Monitor";
  }

  return {
    farm: {
      crop,
      soilType,
      irrigationMethod,
      farmArea: parseFloat(farmArea)
    },
    water: {
      depthMm,
      totalVolumeLiters,
      rainContributionMm,
      irrigationRequiredMm,
      waterSavedLiters,
      irrigationCount,
      waterPerIrrigationMm,
      waterPerIrrigationLiters
    },
    timeline: {
      currentStage: currentStage.name,
      currentDay,
      totalSeasonDays,
      progress,
      daysRemaining: totalSeasonDays - currentDay,
      nextIrrigationDate: nextIrrigationDate.toISOString().split('T')[0]
    },
    weather: {
      temperature: currentTemp,
      rainProbability: rainProbToday,
      windSpeed: currentWind,
      humidity: humidity,
      heatwave,
      rainfallAlert,
      windAlert
    },
    recommendations,
    summary: {
      overallStatus,
      nextAction
    },
    metadata: {
      plannerVersion: "2.0",
      calculationType: "deterministic",
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = {
  generateIrrigationPlan
};
