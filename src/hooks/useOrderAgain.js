import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import { useAuthStore } from '../store/authStore';

export const useOrderAgain = () => {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  return useQuery({
    queryKey: ['orderAgain'],
    queryFn: async () => {
      try {
        const res = await api.get('/api/diner/orders/reorder');
        return res.data.restaurants;
      } catch {
        return [];
      }
    },
    enabled: isLoggedIn,
    staleTime: 0,
  });
};
