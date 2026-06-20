const axios = require('axios');
const NodeCache = require('node-cache');

const weatherCache = new NodeCache({ stdTTL: 1800 }); // 30 minutes
const geoCache = new NodeCache({ stdTTL: 86400 }); // 24 hours

async function getWeatherData(lat, lon) {
  try {
    // Round lat/lon slightly to improve cache hit rates
    const latStr = parseFloat(lat).toFixed(3);
    const lonStr = parseFloat(lon).toFixed(3);
    
    const geoKey = `geo_${latStr}_${lonStr}`;
    const weatherKey = `weather_${latStr}_${lonStr}`;

    const geoPromise = (async () => {
      const cachedGeo = geoCache.get(geoKey);
      if (cachedGeo) return cachedGeo;

      try {
        const geoRes = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, {
          headers: { 'User-Agent': 'KhedutSaathi/1.0' },
          timeout: 5000 
        });
        if (geoRes.data && geoRes.data.address) {
          const address = geoRes.data.address;
          const name = address.village || address.town || address.city || address.county || address.state_district || "Unknown";
          geoCache.set(geoKey, name); // Only cache successful response
          return name;
        }
      } catch (e) {
        console.warn("Reverse geocoding failed", e.message);
      }
      return "Unknown Location"; // Don't cache failures
    })();

    const weatherPromise = (async () => {
      const cachedWeather = weatherCache.get(weatherKey);
      if (cachedWeather) return cachedWeather;

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&hourly=temperature_2m,precipitation_probability,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&timezone=auto&forecast_days=3`;
      const response = await axios.get(url);
      weatherCache.set(weatherKey, response.data); // Only cache successful response
      return response.data;
    })();

    const [locationName, weatherData] = await Promise.all([geoPromise, weatherPromise]);

    return {
      locationName,
      current: {
        temperature: weatherData.current.temperature_2m,
        humidity: weatherData.current.relative_humidity_2m,
        rainProbability: weatherData.hourly.precipitation_probability[0] || 0,
        windSpeed: weatherData.current.wind_speed_10m
      },
      hourly: weatherData.hourly,
      daily: weatherData.daily
    };
  } catch (error) {
    console.error("Error fetching weather data:", error.message);
    throw new Error("Failed to fetch weather data");
  }
}

async function getWeatherByRegion(state, district) {
  try {
    const query = `${district ? district + ', ' : ''}${state}, India`;
    const geoKey = `fwgeo_${query.replace(/\s+/g, '_')}`;
    
    let coords = geoCache.get(geoKey);
    
    if (!coords) {
      const geoRes = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`, {
        headers: { 'User-Agent': 'KhedutSaathi/1.0' },
        timeout: 5000 
      });
      
      if (geoRes.data && geoRes.data.length > 0) {
        coords = { lat: geoRes.data[0].lat, lon: geoRes.data[0].lon };
        geoCache.set(geoKey, coords);
      } else {
        // Fallback coordinates for Gujarat if geocoding fails
        coords = { lat: '22.2587', lon: '71.1924' };
      }
    }
    
    return await getWeatherData(coords.lat, coords.lon);
  } catch (error) {
    console.error("Error in getWeatherByRegion:", error.message);
    // Fallback to Gujarat
    return await getWeatherData('22.2587', '71.1924');
  }
}

module.exports = { getWeatherData, getWeatherByRegion };
