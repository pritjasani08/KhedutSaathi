const Parser = require('rss-parser');
const NodeCache = require('node-cache');
const fs = require('fs');
const path = require('path');
const weatherService = require('../services/weatherService');

const parser = new Parser();
const cache = new NodeCache({ stdTTL: 900 }); // 15 minutes TTL

// Helper to determine category based on keywords
function determineCategory(title, content) {
  const text = `${title} ${content}`.toLowerCase();
  
  if (text.includes('market') || text.includes('price') || text.includes('export') || text.includes('msp') || text.includes('trade')) {
    return 'Market';
  }
  if (text.includes('weather') || text.includes('monsoon') || text.includes('rain') || text.includes('climate') || text.includes('imd')) {
    return 'Weather';
  }
  if (text.includes('government') || text.includes('subsidy') || text.includes('scheme') || text.includes('policy') || text.includes('minister') || text.includes('cabinet')) {
    return 'Government';
  }
  if (text.includes('technology') || text.includes('drone') || text.includes('app') || text.includes('ai ') || text.includes('digital') || text.includes('startup')) {
    return 'Technology';
  }
  if (text.includes('disease') || text.includes('pest') || text.includes('armyworm') || text.includes('fertilizer') || text.includes('soil') || text.includes('health') || text.includes('crop')) {
    return 'Crop Health';
  }
  
  return 'Agriculture'; // Default fallback
}

// Extract image from content or enclosure if available
function extractImage(item) {
  if (item.enclosure && item.enclosure.url) {
    return item.enclosure.url;
  }
  
  // Try extracting from content string if it contains an img tag
  const content = item.content || item['content:encoded'] || '';
  const imgRegex = /<img[^>]+src="?([^"\s]+)"?\s*\/>/g;
  const match = imgRegex.exec(content);
  if (match && match[1]) {
    return match[1];
  }
  
  return null;
}

// Simple string hasher for deterministic fallback selection
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

// Map categories to their specific fallback images using title hash for consistency
function getFallbackImage(category, title) {
  const normalizedCat = category?.toLowerCase() || '';
  const hash = hashString(title || '');
  
  if (normalizedCat.includes('agriculture')) {
    return `/images/news-fallbacks/agriculture-${(hash % 5) + 1}.jpg`;
  }
  if (normalizedCat.includes('weather')) {
    return `/images/news-fallbacks/weather-${(hash % 4) + 1}.jpg`;
  }
  if (normalizedCat.includes('market')) {
    return `/images/news-fallbacks/market-${(hash % 4) + 1}.jpg`;
  }
  if (normalizedCat.includes('government')) {
    return `/images/news-fallbacks/government-${(hash % 3) + 1}.jpg`;
  }
  if (normalizedCat.includes('health') || normalizedCat.includes('disease') || normalizedCat.includes('pest')) {
    return `/images/news-fallbacks/crop-health-${(hash % 4) + 1}.jpg`;
  }
  
  return '/images/news-fallbacks/default.jpg';
}

// Detect language using Unicode ranges
function detectLanguage(text) {
  const gujaratiRegex = /[\u0A80-\u0AFF]/;
  const hindiRegex = /[\u0900-\u097F]/;
  
  if (gujaratiRegex.test(text)) {
    return 'gu';
  } else if (hindiRegex.test(text)) {
    return 'hi';
  }
  return 'en';
}

// Calculate language relevance score
function getLanguageScore(itemLang, selectedLang) {
  if (selectedLang === 'gu') {
    if (itemLang === 'gu') return 3;
    if (itemLang === 'hi') return 2;
    return 1;
  } else if (selectedLang === 'hi') {
    if (itemLang === 'hi') return 3;
    if (itemLang === 'en') return 2;
    return 1;
  } else { // en
    if (itemLang === 'en') return 3;
    if (itemLang === 'en') return 3;
    if (itemLang === 'hi') return 2;
    return 1;
  }
}

// Filter out low quality social media sources
function isLowQualitySource(source) {
  const normalized = source.toLowerCase();
  return (
    normalized.includes('facebook') || 
    normalized.includes('instagram') || 
    normalized.includes('twitter') || 
    normalized.includes('x.com') ||
    normalized.includes('youtube')
  );
}

// Calculate source credibility score
function getSourceScore(source) {
  const normalized = source.toLowerCase();
  
  if (normalized.includes('sandesh') || 
      normalized.includes('divya bhaskar') || 
      normalized.includes('vtv') || 
      normalized.includes('bbc') || 
      normalized.includes('agriculture') || 
      normalized.includes('government') ||
      normalized.includes('kisan') ||
      normalized.includes('krishi') ||
      normalized.includes('icar')) {
    return 3;
  }
  
  return 1;
}

const getNews = async (req, res) => {
  try {
    const language = req.query.language || 'gu';
    const region = req.query.region || 'Gujarat';
    const crop = req.query.crop || '';

    const cacheKey = `agri_news_${language}_${region}_${crop}`;
    const cachedNews = cache.get(cacheKey);
    if (cachedNews) {
      return res.status(200).json({ success: true, data: cachedNews, cached: true });
    }

    let hl, gl, ceid;
    if (language === 'hi') {
      hl = 'hi'; gl = 'IN'; ceid = 'IN:hi';
    } else if (language === 'en') {
      hl = 'en-IN'; gl = 'IN'; ceid = 'IN:en';
    } else { // gu
      hl = 'gu'; gl = 'IN'; ceid = 'IN:gu';
    }

    let regionQuery = region === 'All India' ? 'IN' : region;
    let districtQuery = req.query.district ? ` OR ${req.query.district}` : '';
    
    // Prioritize scheme updates, weather alerts and crop-specific news
    let keywords = ['agriculture', 'farming', 'scheme', 'yojana', 'weather', 'monsoon'];
    if (crop) keywords.push(crop);
    
    const keywordGroup = keywords.join(' OR ');
    const q = encodeURIComponent(`(${keywordGroup}) (${regionQuery}${districtQuery})`);

    const feedUrl = `https://news.google.com/rss/search?q=${q}&hl=${hl}&gl=${gl}&ceid=${ceid}`;
    
    const feed = await parser.parseURL(feedUrl);
    
    // Filter out low quality sources
    const validItems = feed.items.filter(item => {
      let source = item.source || item.title || '';
      return !isLowQualitySource(source);
    });
    
    const allNews = validItems.map((item, index) => {
      // Create a short excerpt from content snippet or title
      let excerpt = item.contentSnippet || item.content || item.title;
      if (excerpt.length > 150) {
        excerpt = excerpt.substring(0, 150) + '...';
      }

      // Google News puts source in source tag or within title " - SourceName"
      let source = item.source || 'Agri News';
      let title = item.title;
      
      if (title.includes(' - ')) {
        const parts = title.split(' - ');
        source = parts.pop();
        title = parts.join(' - ');
      }

      const itemLang = detectLanguage(`${title} ${excerpt}`);
      const category = determineCategory(title, excerpt);
      const extractedImg = extractImage(item);
      // Assign fallback image directly on backend if missing
      const finalImage = extractedImg ? extractedImg : getFallbackImage(category, title);

      return {
        id: `news-${index}-${Date.now()}`,
        title: title,
        date: new Date(item.pubDate || item.isoDate).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        }),
        source: source,
        category: category,
        excerpt: excerpt,
        link: item.link,
        image: finalImage,
        itemLang: itemLang,
        sourceScore: getSourceScore(source)
      };
    });

    // Re-rank based on language AND source credibility
    allNews.sort((a, b) => {
      const langScoreA = getLanguageScore(a.itemLang, language);
      const langScoreB = getLanguageScore(b.itemLang, language);
      
      if (langScoreA !== langScoreB) {
        return langScoreB - langScoreA; // Primary sort by language
      }
      
      // Secondary sort by source credibility
      return b.sourceScore - a.sourceScore;
    });

    // Limit to top 20 and remove temporary fields
    const formattedNews = allNews.slice(0, 20).map(item => {
      delete item.itemLang;
      delete item.sourceScore;
      return item;
    });

    // Save to cache
    cache.set(cacheKey, formattedNews);

    res.status(200).json({ success: true, data: formattedNews, cached: false });
  } catch (error) {
    console.error('Error fetching RSS news:', error);
    res.status(200).json({ success: false, data: [], message: 'Failed to fetch agricultural news.' });
  }
};

const getSchemes = (req, res) => {
  try {
    const filePath = path.join(__dirname, '../data/schemes.json');
    const fileData = fs.readFileSync(filePath, 'utf8');
    const schemes = JSON.parse(fileData);
    
    res.status(200).json({ success: true, data: schemes });
  } catch (error) {
    console.error('Error reading schemes file:', error);
    res.status(500).json({ success: false, message: 'Failed to load government schemes.' });
  }
};

const getWeather = async (req, res) => {
  try {
    const region = req.query.region || 'Gujarat';
    const district = req.query.district || '';
    
    const weatherData = await weatherService.getWeatherByRegion(region, district);
    
    // Generate Farmer Advisory based on weather data
    let advisory = "Conditions are normal.";
    const temp = weatherData.current.temperature;
    const rainProb = weatherData.current.rainProbability;
    
    if (rainProb > 50) {
      advisory = "High probability of rain. Avoid spraying chemicals today. Ensure drainage is clear.";
    } else if (temp > 38) {
      advisory = "High temperature alert. Ensure adequate irrigation. Avoid working in the field during peak afternoon hours.";
    } else if (temp < 10) {
      advisory = "Low temperature alert. Protect sensitive crops from frost.";
    } else {
      advisory = "Favorable conditions for farming activities.";
    }

    // Determine condition string
    let condition = "Clear";
    if (rainProb > 50) condition = "Rainy";
    else if (weatherData.current.humidity > 70) condition = "Cloudy";
    else if (temp > 35) condition = "Hot";

    res.status(200).json({
      success: true,
      data: {
        temperature: temp,
        humidity: weatherData.current.humidity,
        windSpeed: weatherData.current.windSpeed,
        rainProbability: rainProb,
        condition: condition,
        advisory: advisory,
        locationName: weatherData.locationName
      }
    });
  } catch (error) {
    console.error('Error fetching weather:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch weather data.' });
  }
};

module.exports = {
  getNews,
  getSchemes,
  getWeather
};
