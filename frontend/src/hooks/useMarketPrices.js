import { useQuery } from '@tanstack/react-query';
import { marketApi } from '../services/marketApi';

/**
 * Hook to fetch market prices with filters.
 * Utilizes React Query for caching, loading, and error states.
 */
export const useMarketPrices = (filters = {}) => {
  return useQuery({
    queryKey: ['marketPrices', filters],
    queryFn: async () => {
      const res = await marketApi.getPrices(filters);
      // Assuming response format: { success: true, data: [...], meta: {...} }
      return res.data || [];
    },
    // Keep data fresh for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Keep previous data while fetching new to prevent UI flashing
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Hook for dropdown filters
 */
export const useMarketFilters = () => {
  const statesQuery = useQuery({
    queryKey: ['marketStates'],
    queryFn: () => marketApi.getStates().then(res => res.data || []),
    staleTime: Infinity,
  });

  const commoditiesQuery = useQuery({
    queryKey: ['marketCommodities'],
    queryFn: () => marketApi.getCommodities().then(res => res.data || []),
    staleTime: Infinity,
  });

  return {
    states: statesQuery.data || [],
    commodities: commoditiesQuery.data || [],
    isLoading: statesQuery.isLoading || commoditiesQuery.isLoading,
  };
};

export const useDistricts = (state) => {
  return useQuery({
    queryKey: ['marketDistricts', state],
    queryFn: () => marketApi.getDistricts(state).then(res => res.data || []),
    enabled: !!state,
    staleTime: Infinity,
  });
};

export const useMarkets = (district) => {
  return useQuery({
    queryKey: ['marketMarkets', district],
    queryFn: () => marketApi.getMarkets(district).then(res => res.data || []),
    enabled: !!district,
    staleTime: Infinity,
  });
};
