const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';
const BASE_URL = 'https://api.data.gov.in/resource';

// In-memory query cache
const queryCache = new Map();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in ms

function getCached(key) {
  const cached = queryCache.get(key);
  if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
    return cached.data;
  }
  return null;
}

function setCached(key, data) {
  queryCache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

const ALL_INDIAN_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal'
];

const COMMON_CROPS = [
  'Wheat',
  'Rice',
  'Cotton',
  'Groundnut',
  'Cumin',
  'Mustard',
  'Potato',
  'Onion',
  'Tomato',
  'Garlic',
  'Ginger',
  'Soyabean',
  'Maize',
  'Bajra',
  'Jowar',
  'Bengal Gram(Gram)',
  'Green Gram (Moong)',
  'Black Gram (Urad)',
  'Arhar (Tur-Red Gram)',
  'Lentil (Masur)',
  'Sugarcane',
  'Apple',
  'Banana',
  'Mango'
];

function normalizeRecord(rec) {
  return {
    state: rec.state || rec.State || '',
    district: rec.district || rec.District || '',
    market: rec.market || rec.Market || '',
    commodity: rec.commodity || rec.Commodity || '',
    variety: rec.variety || rec.Variety || '',
    grade: rec.grade || rec.Grade || 'FAQ',
    min_price: parseFloat(rec.min_price || rec.Min_Price || 0),
    max_price: parseFloat(rec.max_price || rec.Max_Price || 0),
    modal_price: parseFloat(rec.modal_price || rec.Modal_Price || 0),
    arrival_date: rec.arrival_date || rec.Arrival_Date || '',
  };
}

async function loadLocalFallback() {
  console.log('Loading local fallback mandi dataset...');
  try {
    const filePath = path.join(__dirname, '../data/mandiSeedData.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    const rawData = JSON.parse(fileContent);
    return rawData.map(normalizeRecord);
  } catch (error) {
    console.error('Error reading local fallback file:', error);
    return [];
  }
}

async function getStates() {
  const apiKey = process.env.DATA_GOV_API_KEY;
  const isPlaceholder = !apiKey || apiKey === 'YOUR_DATA_GOV_API_KEY' || apiKey.trim() === '';

  if (isPlaceholder) {
    const { getAllStates } = require('india-states-districts');
    return getAllStates().sort();
  }

  // Live API returns all states in India
  return ALL_INDIAN_STATES;
}

async function getDistricts(state) {
  if (!state) return [];
  
  const cacheKey = `districts-${state}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const apiKey = process.env.DATA_GOV_API_KEY;
  const isPlaceholder = !apiKey || apiKey === 'YOUR_DATA_GOV_API_KEY' || apiKey.trim() === '';

  if (isPlaceholder) {
    try {
      const { getDistrictsByState } = require('india-states-districts');
      return getDistrictsByState(state).sort();
    } catch (err) {
      return [`${state} District 1`, `${state} District 2`];
    }
  }

  try {
    console.log(`Fetching districts for State: "${state}" from data.gov.in...`);
    const response = await axios.get(`${BASE_URL}/${RESOURCE_ID}`, {
      params: {
        'api-key': apiKey,
        format: 'json',
        limit: 1000,
        'filters[State]': state
      },
      timeout: 10000
    });

    if (response.data && Array.isArray(response.data.records)) {
      const records = response.data.records.map(normalizeRecord);
      const districtsSet = new Set(records.map(r => r.district).filter(Boolean));
      const districts = Array.from(districtsSet).sort();
      setCached(cacheKey, districts);
      return districts;
    }
    throw new Error('No records returned from data.gov.in API');
  } catch (error) {
    console.error(`Failed to fetch districts from data.gov.in: ${error.message}. Using fallback.`);
    const fallbackRecords = await loadLocalFallback();
    const districtsSet = new Set(
      fallbackRecords
        .filter(r => r.state.toLowerCase() === state.toLowerCase())
        .map(r => r.district)
        .filter(Boolean)
    );
    return Array.from(districtsSet).sort();
  }
}

async function getMandis(district) {
  if (!district) return [];

  const cacheKey = `mandis-${district}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const apiKey = process.env.DATA_GOV_API_KEY;
  const isPlaceholder = !apiKey || apiKey === 'YOUR_DATA_GOV_API_KEY' || apiKey.trim() === '';

  if (isPlaceholder) {
    return [
      `${district} APMC`,
      `${district} Sub-Market`,
      `${district} Wholesale Market`
    ];
  }

  try {
    console.log(`Fetching mandis for District: "${district}" from data.gov.in...`);
    const response = await axios.get(`${BASE_URL}/${RESOURCE_ID}`, {
      params: {
        'api-key': apiKey,
        format: 'json',
        limit: 1000,
        'filters[District]': district
      },
      timeout: 10000
    });

    if (response.data && Array.isArray(response.data.records)) {
      const records = response.data.records.map(normalizeRecord);
      const mandisSet = new Set(records.map(r => r.market).filter(Boolean));
      const mandis = Array.from(mandisSet).sort();
      setCached(cacheKey, mandis);
      return mandis;
    }
    throw new Error('No records returned from data.gov.in API');
  } catch (error) {
    console.error(`Failed to fetch mandis from data.gov.in: ${error.message}. Using fallback.`);
    const fallbackRecords = await loadLocalFallback();
    const mandisSet = new Set(
      fallbackRecords
        .filter(r => r.district.toLowerCase() === district.toLowerCase())
        .map(r => r.market)
        .filter(Boolean)
    );
    return Array.from(mandisSet).sort();
  }
}

async function getCrops() {
  const apiKey = process.env.DATA_GOV_API_KEY;
  const isPlaceholder = !apiKey || apiKey === 'YOUR_DATA_GOV_API_KEY' || apiKey.trim() === '';

  if (isPlaceholder) {
    return COMMON_CROPS.sort();
  }

  return COMMON_CROPS;
}

async function getPrices({ state, district, mandi, crop }) {
  const cacheKey = `prices-${state || ''}-${district || ''}-${mandi || ''}-${crop || ''}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const apiKey = process.env.DATA_GOV_API_KEY;
  const isPlaceholder = !apiKey || apiKey === 'YOUR_DATA_GOV_API_KEY' || apiKey.trim() === '';

  if (isPlaceholder) {
    // Generate dynamic mock data based on the requested parameters
    const targetState = state || 'Gujarat';
    const targetDistrict = district || 'Ahmedabad';
    const targetMandi = mandi || `${targetDistrict} APMC`;
    const cropsToGenerate = crop ? [crop] : COMMON_CROPS.slice(0, 8); // Random 8 crops if none selected

    const result = cropsToGenerate.map((c, index) => {
      // Simple string hash function to generate variance based on location
      const locationString = targetState + targetDistrict + targetMandi;
      let hash = 0;
      for (let i = 0; i < locationString.length; i++) {
        hash = ((hash << 5) - hash) + locationString.charCodeAt(i);
        hash |= 0; 
      }
      const locationVariance = Math.abs(hash) % 800; // Variance up to 800
      
      // Create some pseudo-randomness based on crop name length + index + location variance
      const basePrice = 1000 + ((c.length * 300) % 5000) + (index * 150) + locationVariance;
      const minPrice = basePrice - 200 - (locationVariance % 50);
      const maxPrice = basePrice + 300 + (locationVariance % 50);
      
      let trend = 'stable';
      const lastDigit = basePrice % 3;
      if (lastDigit === 0) trend = 'up';
      if (lastDigit === 1) trend = 'down';

      return {
        crop: c,
        min: minPrice,
        max: maxPrice,
        avg: basePrice,
        trend,
        variety: 'Local',
        grade: 'FAQ',
        state: targetState,
        district: targetDistrict,
        mandi: targetMandi,
        date: new Date().toLocaleDateString('en-GB')
      };
    });
    return result;
  }

  try {
    console.log(`Fetching prices with filters: State="${state || ''}", District="${district || ''}", Mandi="${mandi || ''}", Crop="${crop || ''}"...`);
    const params = {
      'api-key': apiKey,
      format: 'json',
      limit: 1000
    };
    if (state) params['filters[State]'] = state;
    if (district) params['filters[District]'] = district;
    if (mandi) params['filters[Market]'] = mandi;
    if (crop) params['filters[Commodity]'] = crop;

    const response = await axios.get(`${BASE_URL}/${RESOURCE_ID}`, {
      params,
      timeout: 10000
    });

    if (response.data && Array.isArray(response.data.records)) {
      const records = response.data.records.map(normalizeRecord);
      const result = records.map(r => {
        let trend = 'stable';
        const lastDigit = Math.floor(r.modal_price) % 3;
        if (lastDigit === 0) trend = 'up';
        if (lastDigit === 1) trend = 'down';

        return {
          crop: r.commodity,
          min: r.min_price,
          max: r.max_price,
          avg: r.modal_price,
          trend,
          variety: r.variety,
          grade: r.grade,
          state: r.state,
          district: r.district,
          mandi: r.market,
          date: r.arrival_date,
        };
      });
      setCached(cacheKey, result);
      return result;
    }
    throw new Error('No records returned from data.gov.in API');
  } catch (error) {
    console.error(`Failed to fetch prices from data.gov.in: ${error.message}. Using fallback.`);
    let records = await loadLocalFallback();
    if (state) records = records.filter(r => r.state.toLowerCase() === state.toLowerCase());
    if (district) records = records.filter(r => r.district.toLowerCase() === district.toLowerCase());
    if (mandi) records = records.filter(r => r.market.toLowerCase() === mandi.toLowerCase());
    if (crop) records = records.filter(r => r.commodity.toLowerCase() === crop.toLowerCase());

    const result = records.map(r => {
      let trend = 'stable';
      const lastDigit = Math.floor(r.modal_price) % 3;
      if (lastDigit === 0) trend = 'up';
      if (lastDigit === 1) trend = 'down';

      return {
        crop: r.commodity,
        min: r.min_price,
        max: r.max_price,
        avg: r.modal_price,
        trend,
        variety: r.variety,
        grade: r.grade,
        state: r.state,
        district: r.district,
        mandi: r.market,
        date: r.arrival_date,
      };
    });
    return result;
  }
}

module.exports = {
  getStates,
  getDistricts,
  getMandis,
  getCrops,
  getPrices,
};
