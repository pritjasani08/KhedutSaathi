import api from './api';

export const getIrrigationAdvice = async (lat, lon, crop = 'Wheat') => {
  try {
    const data = await api.get('/irrigation/advice', {
      params: { lat, lon, crop }
    });
    return data;
  } catch (error) {
    console.error('Error fetching irrigation advice:', error);
    throw error;
  }
};
