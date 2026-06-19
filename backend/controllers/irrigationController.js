const { getWeatherData } = require('../services/weatherService');
const { getIrrigationAdvice } = require('../services/irrigationService');

async function getAdvice(req, res) {
  try {
    const { lat, lon, crop } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ message: "Latitude and longitude are required." });
    }

    const weatherData = await getWeatherData(lat, lon);
    const cropName = crop || "Crops";
    const advice = getIrrigationAdvice(weatherData, cropName);

    const responseData = {
      location: {
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        name: advice.location.name
      },
      weather: advice.weather,
      recommendation: advice.recommendation,
      farmerAction: advice.farmerAction,
      forecast: advice.forecast,
      confidence: advice.confidence
    };

    res.json(responseData);
  } catch (error) {
    console.error("Irrigation advice error:", error);
    res.status(500).json({ message: "Failed to get irrigation advice" });
  }
}

module.exports = { getAdvice };
