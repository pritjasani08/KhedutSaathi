import apiClient from './apiClient';

export const getIrrigationAdvice = async (lat, lon, crop = 'Wheat') => {
  try {
    const response = await apiClient.get('/irrigation/advice', {
      params: { lat, lon, crop }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching irrigation advice:', error);
    throw error;
  }
};
