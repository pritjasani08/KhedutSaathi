import api from './api';

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

    const data = await api.post(`${ML_API_URL}/api/crop-disease/predict?lang=${lang}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!data || !data.success) {
      throw new Error(data?.detail || 'Failed to analyze crop image');
    }

    return data;
  },

  /**
   * Predict crop yield
   * @param {Object} payload - The yield prediction parameters
   * @returns {Promise<Object>} - The yield prediction result
   */
  predictYield: async (payload) => {
    const YIELD_API_URL = import.meta.env.VITE_YIELD_API_URL || 'http://127.0.0.1:8002';
    
    const data = await api.post(`${YIELD_API_URL}/predict`, payload);
    return data;
  }
};
