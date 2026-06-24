import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import { QUERY_KEYS } from '../lib/constants';
import { useAuthStore } from '../store/authStore';
import type { Restaurant } from '../types/restaurant';

interface PastOrder {
  id: number;
  restaurant_id: number;
  restaurant: Restaurant;
  total: number;
  created_at: string;
}

export const useOrderAgain = () => {
  const isAuthenticated = useAuthStore((s) => !!s.token);
  return useQuery<PastOrder[]>({
    queryKey: [QUERY_KEYS.orderAgain],
    queryFn: async () => {
      const res = await api.get('/orders/my');
      return res.data.data;
    },
    enabled: isAuthenticated,
  });
};
