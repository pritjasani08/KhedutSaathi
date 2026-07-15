import { useQuery } from '@tanstack/react-query';
import { aiEngineAPI } from '../../../services/api';

export function useAIBriefing() {
  return useQuery({
    queryKey: ['aiBriefing'],
    queryFn: async () => {
      const response = await aiEngineAPI.getBriefing();
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Don't retry too many times if the engine is down
  });
}
