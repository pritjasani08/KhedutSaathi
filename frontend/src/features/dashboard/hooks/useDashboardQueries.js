import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';
import { dashboardKeys } from '../constants/queryKeys';
import { DASHBOARD_CACHE_TIMES, DASHBOARD_STALE_TIMES } from '../constants/dashboard.constants';

export const useDashboardOverview = () => {
  return useQuery({
    queryKey: dashboardKeys.overview(),
    queryFn: dashboardService.getOverview,
    staleTime: DASHBOARD_STALE_TIMES.OVERVIEW,
    gcTime: DASHBOARD_CACHE_TIMES.OVERVIEW,
  });
};

export const useWeather = (region) => {
  return useQuery({
    queryKey: dashboardKeys.weather(region),
    queryFn: () => dashboardService.getWeather(region),
    enabled: !!region,
    staleTime: DASHBOARD_STALE_TIMES.WEATHER,
    gcTime: DASHBOARD_CACHE_TIMES.WEATHER,
  });
};

export const useMarket = (profile) => {
  const { state, district, primary_crop: commodity } = profile || {};
  return useQuery({
    queryKey: dashboardKeys.market(state, district, commodity),
    queryFn: () => dashboardService.getMarketPrices({ state, district, commodity }),
    enabled: !!commodity,
    staleTime: DASHBOARD_STALE_TIMES.MARKET_PRICES,
    gcTime: DASHBOARD_CACHE_TIMES.MARKET_PRICES,
  });
};

export const useSchemes = (profile) => {
  return useQuery({
    queryKey: dashboardKeys.schemes(profile),
    queryFn: () => dashboardService.getSchemes(profile),
    enabled: !!profile,
    staleTime: DASHBOARD_STALE_TIMES.PROFILE, // Schemes depend on profile
    gcTime: DASHBOARD_CACHE_TIMES.PROFILE,
  });
};

export const useNews = (profile) => {
  const { preferred_language, state, primary_crop } = profile || {};
  return useQuery({
    queryKey: dashboardKeys.news(preferred_language, state, primary_crop),
    queryFn: () => dashboardService.getNews(profile),
    enabled: !!profile,
    staleTime: DASHBOARD_STALE_TIMES.NEWS,
    gcTime: DASHBOARD_CACHE_TIMES.NEWS,
  });
};

export const useAcceptBid = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bidId) => dashboardService.acceptBid(bidId),
    onSuccess: () => {
      // Invalidate the overview to refetch listings/stats
      queryClient.invalidateQueries({ queryKey: dashboardKeys.overview() });
    },
  });
};
