import api from './api';

export const marketApi = {
  /**
   * Fetch market prices with optional filters
   */
  getPrices: async (params = {}) => {
    // If no specific filters, we might want to fetch a global overview.
    // Assuming backend returns a broad set if params are empty.
    return await api.get('/market-prices', { params });
  },

  getPersonalizedFeed: async (params = {}) => {
    return await api.get('/market-prices/feed', { params });
  },

  /**
   * Fetch distinct states
   */
  getStates: async () => {
    return await api.get('/market-prices/states');
  },

  /**
   * Fetch distinct districts for a state
   */
  getDistricts: async (state) => {
    return await api.get('/market-prices/districts', { params: { state } });
  },

  /**
   * Fetch distinct markets for a district
   */
  getMarkets: async (district) => {
    return await api.get('/market-prices/markets', { params: { district } });
  },

  /**
   * Fetch distinct commodities
   */
  getCommodities: async () => {
    return await api.get('/market-prices/commodities');
  }
};
