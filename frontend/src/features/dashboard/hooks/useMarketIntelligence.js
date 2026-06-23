import { useQuery } from '@tanstack/react-query';
import { getMarketIntelligence } from '../services/marketIntelligenceService';

export const useMarketIntelligence = (profileData) => {
  return useQuery({
    queryKey: ['marketIntelligence', profileData?.primary_crop, profileData?.state, profileData?.district],
    queryFn: () => getMarketIntelligence(profileData),
    enabled: !!profileData?.primary_crop, // Only run if we have a primary crop
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: 2, // Retry failed requests twice
  });
};
