import apiClient from './apiClient';

export const marketApi = {
  /**
   * Fetch market prices with optional filters
   */
  getPrices: async (params = {}) => {
    // If no specific filters, we might want to fetch a global overview.
    // Assuming backend returns a broad set if params are empty.
    const response = await apiClient.get('/market-prices', { params });
    return response.data;
  },

  /**
   * Fetch distinct states
   */
  getStates: async () => {
    const response = await apiClient.get('/market-prices/states');
    return response.data;
  },

  /**
   * Fetch distinct districts for a state
   */
  getDistricts: async (state) => {
    const response = await apiClient.get('/market-prices/districts', { params: { state } });
    return response.data;
  },

  /**
   * Fetch distinct markets for a district
   */
  getMarkets: async (district) => {
    const response = await apiClient.get('/market-prices/markets', { params: { district } });
    return response.data;
  },

  /**
   * Fetch distinct commodities
   */
  getCommodities: async () => {
    const response = await apiClient.get('/market-prices/commodities');
    return response.data;
  }
};
