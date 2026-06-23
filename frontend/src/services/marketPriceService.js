import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
});

const CACHE_EXPIRY = 5 * 60 * 1000;
const cache = new Map();

/**
 * Fetch market prices with filters.
 * Returns the full backend response: { success, data: [...], meta: {...} }
 */
export const fetchMarketPrices = async (params = {}) => {
  try {
    const response = await apiClient.get('/market-prices', { params });
    // response.data = { success: true, data: [...records], meta: {...} }
    return response.data;
  } catch (error) {
    console.error('Error fetching market prices:', error);
    throw error.response?.data || { message: 'Failed to fetch market prices' };
  }
};

const fetchWithCache = async (url, params = {}) => {
  const cacheKey = `${url}?${new URLSearchParams(params).toString()}`;

  if (cache.has(cacheKey)) {
    const { data, timestamp } = cache.get(cacheKey);
    if (Date.now() - timestamp < CACHE_EXPIRY) {
      return data;
    }
  }

  const response = await apiClient.get(url, { params });
  cache.set(cacheKey, { data: response.data, timestamp: Date.now() });
  return response.data;
};

export const fetchStates = async () => {
  try {
    return await fetchWithCache('/market-prices/states');
  } catch (error) {
    console.error('Error fetching states:', error);
    return { data: [] };
  }
};

export const fetchDistricts = async (state) => {
  try {
    return await fetchWithCache('/market-prices/districts', { state });
  } catch (error) {
    console.error('Error fetching districts:', error);
    return { data: [] };
  }
};

export const fetchMarkets = async (district) => {
  try {
    return await fetchWithCache('/market-prices/markets', { district });
  } catch (error) {
    console.error('Error fetching markets:', error);
    return { data: [] };
  }
};

export const fetchCommodities = async (params = {}) => {
  try {
    return await fetchWithCache('/market-prices/commodities', params);
  } catch (error) {
    console.error('Error fetching commodities:', error);
    return { data: [] };
  }
};
