const axios = require('axios');
const NodeCache = require('node-cache');
const apiConfig = require('../config/apiConfig');

// Initialize node-cache with 30-minute default TTL
const cache = new NodeCache({
  stdTTL: apiConfig.CACHE.STD_TTL,
  checkperiod: apiConfig.CACHE.CHECK_PERIOD
});

// Helper to validate and get API key
const getApiKey = () => {
  const apiKey = process.env.DATA_GOV_API_KEY;
  if (!apiKey || apiKey.trim() === 'YOUR_DATA_GOV_API_KEY') {
    throw new Error('API_KEY_MISSING: The Data.gov.in API key is missing or invalid.');
  }
  return apiKey.trim();
};

const getResourceId = () => {
  const resourceId = apiConfig?.AGMARKNET?.RESOURCE_ID;
  if (!resourceId) {
    throw new Error('RESOURCE_ID_MISSING: The Data.gov.in API Resource ID is missing in configuration.');
  }
  return resourceId;
};

// Helper: Fetch a large recent dataset to derive unique states/districts/markets/commodities
const fetchAllRecentData = async () => {
  const cacheKey = 'market-prices-recent-bulk-data';
  const cachedData = cache.get(cacheKey);
  if (cachedData) return cachedData;

  const apiKey = getApiKey();
  const url = `${apiConfig.AGMARKNET.BASE_URL}/${getResourceId()}`;

  try {
    const response = await axios.get(url, {
      params: {
        'api-key': apiKey,
        format: apiConfig.AGMARKNET.FORMAT,
        limit: 5000,
        offset: 0
      },
      timeout: 30000
    });

    if (response.data && response.data.status === 'ok') {
      cache.set(cacheKey, response.data.records, 3600); // Cache for 1 hour
      return response.data.records;
    }
    return [];
  } catch (error) {
    console.error('Error fetching bulk data:', error.message);
    return [];
  }
};

const getStates = async () => {
  const records = await fetchAllRecentData();
  const states = [...new Set(records.map(r => r.state))].filter(Boolean).sort();
  return states;
};

const getDistricts = async (state) => {
  const records = await fetchAllRecentData();
  let filtered = records;
  if (state) {
    filtered = records.filter(r => r.state && r.state.trim().toLowerCase() === state.trim().toLowerCase());
  }
  const districts = [...new Set(filtered.map(r => r.district))].filter(Boolean).sort();
  return districts;
};

const getMarkets = async (district) => {
  const records = await fetchAllRecentData();
  let filtered = records;
  if (district) {
    filtered = records.filter(r => r.district && r.district.trim().toLowerCase() === district.trim().toLowerCase());
  }
  const markets = [...new Set(filtered.map(r => r.market))].filter(Boolean).sort();
  return markets;
};



/**
 * Fetches market prices from the AGMARKNET API.
 * 
 * NEW FLOW (Mandi-first):
 *   1. Fetch a LARGE dataset (5000 records) with server-side state+district+market filters.
 *   2. Apply commodity filter in-memory if provided.
 *   3. Return ALL matching records — pagination is UI-only.
 *   4. Include enriched meta: totalRecordsFetched, totalRecordsAfterFiltering, totalCommodities.
 */
const fetchMarketPrices = async (queryParams) => {
  const { state, district, market, commodity, sortBy, order = 'desc' } = queryParams;
  const apiKey = getApiKey();
  const resourceId = getResourceId();

  // Build the external API params — fetch a large set, let Data.gov filter by state/district/market
  const params = {
    'api-key': apiKey,
    format: apiConfig.AGMARKNET.FORMAT,
    limit: 5000,
    offset: 0
  };

  if (state) params['filters[state]'] = state;
  if (district) params['filters[district]'] = district;
  if (market) params['filters[market]'] = market;
  // Do NOT pass commodity to the API — we filter in-memory to return ALL commodities first

  const cacheKey = `market-prices-mandi-${JSON.stringify(params, Object.keys(params).sort())}`;
  const cachedData = cache.get(cacheKey);

  let allRecords = [];
  let totalRecordsFetched = 0;

  if (cachedData) {
    allRecords = cachedData.records;
    totalRecordsFetched = cachedData.totalRecordsFetched;
  } else {
    try {
      const url = `${apiConfig.AGMARKNET.BASE_URL}/${resourceId}`;
      const response = await axios.get(url, { params, timeout: 30000 });

      if (response.data && response.data.status === 'ok') {
        allRecords = response.data.records || [];
        totalRecordsFetched = response.data.total || allRecords.length;
        cache.set(cacheKey, { records: allRecords, totalRecordsFetched });
      } else {
        throw new Error(`INVALID_RESPONSE: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      if (error.code === 'ECONNABORTED') throw new Error('API_TIMEOUT: Connection timed out.');
      if (error.response) throw new Error(`EXTERNAL_API_ERROR: ${error.response.status}`);
      if (error.message.startsWith('INVALID_RESPONSE')) throw error;
      throw new Error(`API_COMMUNICATION_ERROR: ${error.message}`);
    }
  }

  // In-memory strict filters (AGMARKNET API can be fuzzy or buggy)
  let filteredRecords = allRecords;
  
  if (state) {
    filteredRecords = filteredRecords.filter(r => r.state && r.state.trim().toLowerCase() === state.trim().toLowerCase());
  }
  if (district) {
    filteredRecords = filteredRecords.filter(r => r.district && r.district.trim().toLowerCase() === district.trim().toLowerCase());
  }
  if (market) {
    filteredRecords = filteredRecords.filter(r => r.market && r.market.trim().toLowerCase() === market.trim().toLowerCase());
  }
  if (commodity) {
    filteredRecords = filteredRecords.filter(r =>
      r.commodity && r.commodity.trim().toLowerCase().includes(commodity.trim().toLowerCase())
    );
  }

  // In-memory sorting
  if (sortBy) {
    filteredRecords = [...filteredRecords].sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (!isNaN(valA) && !isNaN(valB)) {
        valA = parseFloat(valA);
        valB = parseFloat(valB);
      }

      if (valA < valB) return order === 'desc' ? 1 : -1;
      if (valA > valB) return order === 'desc' ? -1 : 1;
      return 0;
    });
  }

  // Count unique commodities
  const totalCommodities = new Set(filteredRecords.map(r => r.commodity)).size;

  return {
    records: filteredRecords,
    totalRecordsFetched,
    totalRecordsAfterFiltering: filteredRecords.length,
    totalCommodities,
    total: filteredRecords.length,
    count: filteredRecords.length
  };
};

const getCommodities = async ({ state, district, market } = {}) => {
  let records = [];
  
  if (market) {
    // Fetch a large dataset specifically for this market to ensure we don't miss any crops
    const data = await fetchMarketPrices({ state, district, market, limit: 5000 });
    records = data.records || [];
  } else {
    // Fallback to nationwide recent data
    records = await fetchAllRecentData();
  }

  const commodities = [...new Set(records.map(r => r.commodity))].filter(Boolean).sort();
  return commodities;
};

module.exports = {
  fetchMarketPrices,
  getStates,
  getDistricts,
  getMarkets,
  getCommodities
};
