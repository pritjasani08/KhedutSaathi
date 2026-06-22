import apiClient from './apiClient';

const ML_API_URL = import.meta.env.VITE_ML_API_URL || 'http://localhost:8000';

/**
 * Service to handle all Machine Learning model interactions
 */
export const mlApi = {
  /**
   * Predict crop disease from an image
   * @param {File} image - The image file to analyze
   * @param {string} lang - The language code (e.g., 'en', 'hi', 'gu')
   * @returns {Promise<Object>} - The prediction result
   */
  predictDisease: async (image, lang = 'en') => {
    const formData = new FormData();
    formData.append('image', image);

    const response = await apiClient.post(`${ML_API_URL}/api/crop-disease/predict?lang=${lang}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.data || !response.data.success) {
      throw new Error(response.data?.detail || 'Failed to analyze crop image');
    }

    return response.data;
  },

  /**
   * Predict crop yield
   * @param {Object} payload - The yield prediction parameters
   * @returns {Promise<Object>} - The yield prediction result
   */
  predictYield: async (payload) => {
    const YIELD_API_URL = import.meta.env.VITE_YIELD_API_URL || 'http://127.0.0.1:8002';
    
    const response = await apiClient.post(`${YIELD_API_URL}/predict`, payload);
    return response.data;
  }
};
