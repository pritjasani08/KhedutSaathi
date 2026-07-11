import axios from 'axios';

// Custom Error Class
export class AuthenticationError extends Error {
  constructor(message = 'Session expired. Please log in again.') {
    super(message);
    this.name = 'AuthenticationError';
    this.isAuthError = true;
  }
}


const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let errorMsg;
    
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        error.customMessage = 'Session expired. Please log in again.';
        return Promise.reject(new AuthenticationError());
      }

      const data = error.response.data;
      if (data && data.detail) {
        if (Array.isArray(data.detail)) {
          errorMsg = data.detail.map(d => typeof d === 'object' ? d.msg || JSON.stringify(d) : String(d)).join(', ');
        } else if (typeof data.detail === 'string') {
          errorMsg = data.detail;
        } else {
          errorMsg = JSON.stringify(data.detail);
        }
      } else if (data && data.message) {
        errorMsg = data.message;
      } else {
        errorMsg = `Server error: ${error.response.status}`;
      }
    } else if (error.request) {
      errorMsg = 'No response from server. Please check your connection.';
    } else {
      errorMsg = error.message;
    }

    error.customMessage = errorMsg;
    console.error('API Error:', errorMsg);
    
    return Promise.reject(error);
  }
);

// [TEMPORARY] Domain API Objects
// These will be extracted into dedicated service files during Sprint 2.

// Crop Diagnosis
export const cropDiagnosisAPI = {
  diagnose: (formData) => api.post('/diagnosis/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getHistory: () => api.get('/diagnosis/history'),
  saveHistory: (data) => api.post('/diagnosis/history', data),
};

// Market Hub - Mandi Prices
export const mandiAPI = {
  getPrices: (params) => api.get('/mandi/prices', { params }),
  getStates: () => api.get('/mandi/states'),
  getDistricts: (state) => api.get(`/mandi/districts/${state}`),
  getMandis: (district) => api.get(`/mandi/mandis/${district}`),
  getCrops: () => api.get('/mandi/crops'),
};

// Sell Yield
export const sellYieldAPI = {
  createListing: (data) => api.post('/sell-yield', data),
  getListings: (params) => api.get('/sell-yield', { params }),
  placeBid: (listingId, data) => api.post(`/sell-yield/${listingId}/bid`, data),
};

// Expert Panel - Crop Planner
export const cropPlannerAPI = {
  getRecommendations: (data) => api.post('/crop-planner/recommend', data),
};

// Yield Predictor
export const yieldPredictorAPI = {
  predict: (data) => api.post('/yield-predictor/predict', data),
};

// Smart Irrigation
export const irrigationAPI = {
  getWeather: (location) => api.get('/irrigation/weather', { params: { location } }),
  getRecommendations: (data) => api.post('/irrigation/recommend', data),
};

// Agri Marketplace
export const marketplaceAPI = {
  getProducts: (params) => api.get('/marketplace/products', { params }),
  getCategories: () => api.get('/marketplace/categories'),
  getProductById: (id) => api.get(`/marketplace/products/${id}`),
  contactSeller: (productId, data) => api.post(`/marketplace/products/${productId}/contact`, data),
};

// Chatbot
export const chatbotAPI = {
  sendMessage: (data) => api.post('/chatbot/message', data),
  sendVoice: (formData) => api.post('/chatbot/voice', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export default api;
