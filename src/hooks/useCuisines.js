import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import { MOCK_CUISINES } from '../lib/mockData';

export const useCuisines = () =>
  useQuery({
    queryKey: ['cuisines'],
    queryFn: async () => {
      try {
        const res = await api.get('/api/diner/cuisines');
        return res.data.cuisines.map((c) => ({
          ...c,
          imageUrl: c.imageUrl || c.iconUrl || null,
        }));
      } catch {
        return MOCK_CUISINES;
      }
    },
    staleTime: 24 * 60 * 60 * 1000,
  });
