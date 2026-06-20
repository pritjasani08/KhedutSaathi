import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getIrrigationAdvice = async (lat, lon, crop = 'Wheat') => {
  try {
    const response = await axios.get(`${API_BASE_URL}/irrigation/advice`, {
      params: { lat, lon, crop }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching irrigation advice:', error);
    throw error;
  }
};
