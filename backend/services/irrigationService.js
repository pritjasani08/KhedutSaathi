function getIrrigationAdvice(weatherData, cropName = "Crops") {
  const currentTemp = Math.round(weatherData.current.temperature);
  const currentHumidity = Math.round(weatherData.current.humidity);
  const currentWind = Math.round(weatherData.current.windSpeed);
  const rainProbToday = weatherData.daily.precipitation_probability_max[0] || weatherData.hourly.precipitation_probability[0] || 0;

  let recommendation = {
    status: "IRRIGATION_RECOMMENDED",
    title: "Irrigation Recommended",
    reason: `Optimal conditions to hydrate your ${cropName}.`,
    bestTime: null,
    waterSavingEstimate: null
  };

  if (rainProbToday >= 60) {
    recommendation = {
      status: "DO_NOT_IRRIGATE",
      title: "Do Not Irrigate Today",
      reason: `Expected rainfall will naturally hydrate your ${cropName}, saving manual labor.`,
      bestTime: null,
      waterSavingEstimate: "100-200 Litres"
    };
  } else if (currentHumidity > 80) {
    recommendation = {
      status: "WAIT_AND_MONITOR",
      title: "Wait and Monitor",
      reason: `Current humidity is retaining soil moisture perfectly for your ${cropName}. Watering now could cause waterlogging.`,
      bestTime: null,
      waterSavingEstimate: "50-100 Litres"
    };
  } else if (currentWind > 25) {
    recommendation = {
      status: "DELAY_IRRIGATION",
      title: "Delay Irrigation",
      reason: `Strong winds are currently blowing; watering your ${cropName} now will result in severe evaporation loss.`,
      bestTime: null,
      waterSavingEstimate: null
    };
  } else if (rainProbToday < 60 && currentTemp > 32) {
    recommendation = {
      status: "IRRIGATION_RECOMMENDED",
      title: "Irrigation Recommended",
      reason: `Rising temperatures require immediate soil cooling to prevent heat stress on your ${cropName} roots.`,
      bestTime: calculateBestTime(weatherData.hourly),
      waterSavingEstimate: null
    };
  } else {
    recommendation.bestTime = calculateBestTime(weatherData.hourly);
  }

  // Next Check Time Logic
  const nextCheckTime = new Date();
  if (recommendation.status === "WAIT_AND_MONITOR" || recommendation.status === "DELAY_IRRIGATION") {
    nextCheckTime.setHours(nextCheckTime.getHours() + 4);
  } else {
    nextCheckTime.setHours(nextCheckTime.getHours() + 12);
  }

  const farmerAction = {
    todayAction: recommendation.title,
    nextCheckTime: nextCheckTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    waterSaving: recommendation.waterSavingEstimate || "0 Litres"
  };

  let confidenceScore = 100;
  const factors = [];

  if (Math.abs(rainProbToday - 60) < 15) {
    confidenceScore -= (15 - Math.abs(rainProbToday - 60)) * 1.5;
    factors.push(`Rain forecast is uncertain (${rainProbToday}%), monitor clouds closely.`);
  } else if (rainProbToday >= 60) {
    factors.push(`High probability of natural rain (${rainProbToday}%) guarantees sufficient moisture.`);
  } else {
    factors.push(`Low rain probability means you must rely on manual irrigation.`);
  }

  if (Math.abs(currentHumidity - 80) < 10) {
    confidenceScore -= (10 - Math.abs(currentHumidity - 80)) * 1.5;
    factors.push(`Air moisture is shifting, soil may dry out faster than expected.`);
  } else if (currentHumidity > 80) {
    factors.push(`High air moisture (${currentHumidity}%) is acting as a natural blanket for the soil.`);
  } else {
    factors.push(`Dry air (${currentHumidity}%) is actively pulling moisture from the soil.`);
  }

  if (Math.abs(currentWind - 25) < 8) {
    confidenceScore -= (8 - Math.abs(currentWind - 25)) * 2;
    factors.push(`Breezy conditions may cause uneven water distribution.`);
  } else if (currentWind > 25) {
    factors.push(`High winds (${currentWind} km/h) will blow water away from the root zone.`);
  } else {
    factors.push(`Calm winds ensure water reaches the roots precisely.`);
  }

  const tomorrowRain = weatherData.daily.precipitation_probability_max[1] || 0;
  if (Math.abs(rainProbToday - tomorrowRain) > 40) {
    confidenceScore -= 10;
    factors.push(`Tomorrow's weather looks very different; plan irrigation day-by-day.`);
  } else {
    factors.push(`Upcoming weather is stable, allowing for a predictable watering schedule.`);
  }

  confidenceScore = Math.max(50, Math.min(100, Math.round(confidenceScore)));

  let level = "Low";
  if (confidenceScore >= 90) level = "Very High";
  else if (confidenceScore >= 75) level = "High";
  else if (confidenceScore >= 60) level = "Medium";

  const forecast = weatherData.daily.time.map((dateStr, index) => {
    const rain = weatherData.daily.precipitation_probability_max[index];
    let rec = "Irrigate";
    if (rain >= 60) rec = "Don't Irrigate";
    else if (weatherData.daily.wind_speed_10m_max[index] > 25) rec = "Delay";
    
    let dayLabel = "Today";
    if (index === 1) dayLabel = "Tomorrow";
    else if (index === 2) dayLabel = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });

    return {
      day: dayLabel,
      rain: rain,
      recommendation: rec,
      temp: `${Math.round(weatherData.daily.temperature_2m_max[index])}°C`,
    };
  });

  return {
    location: {
      name: weatherData.locationName
    },
    weather: {
      temperature: currentTemp,
      humidity: currentHumidity,
      rainProbability: rainProbToday,
      windSpeed: currentWind
    },
    recommendation,
    farmerAction,
    forecast,
    confidence: {
      score: confidenceScore,
      level,
      factors
    }
  };
}

function calculateBestTime(hourlyData) {
  let bestHour = -1;
  let minTemp = 999;
  
  for (let i = 0; i < 24; i++) {
    const time = new Date(hourlyData.time[i]);
    const hour = time.getHours();
    
    if ((hour >= 4 && hour <= 8) || (hour >= 18 && hour <= 21)) {
      if (hourlyData.precipitation_probability[i] < 30 && hourlyData.wind_speed_10m[i] < 20) {
        if (hourlyData.temperature_2m[i] < minTemp) {
          minTemp = hourlyData.temperature_2m[i];
          bestHour = hour;
        }
      }
    }
  }

  if (bestHour === -1) {
    return "6:00 PM - 8:00 PM";
  }

  if (bestHour >= 4 && bestHour <= 8) {
    return "5:00 AM - 8:00 AM";
  } else {
    return "6:00 PM - 8:00 PM";
  }
}

module.exports = { getIrrigationAdvice };
