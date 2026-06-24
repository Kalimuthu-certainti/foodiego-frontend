import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';

export const useLocationSearch = (query) =>
  useQuery({
    queryKey: ['locationSearch', query],
    queryFn: async () => {
      try {
        const res = await api.get('/api/diner/location/search', { params: { q: query } });
        return res.data.results;
      } catch {
        return [];
      }
    },
    enabled: query?.length >= 2,
    staleTime: 60 * 60 * 1000,
  });
