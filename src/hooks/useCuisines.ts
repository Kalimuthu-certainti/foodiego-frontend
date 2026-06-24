import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import { QUERY_KEYS } from '../lib/constants';
import type { Cuisine } from '../types/cuisine';

export const useCuisines = () =>
  useQuery<Cuisine[]>({
    queryKey: [QUERY_KEYS.cuisines],
    queryFn: async () => {
      const res = await api.get('/cuisines');
      return res.data.data;
    },
    staleTime: Infinity,
  });
