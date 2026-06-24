import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import { MOCK_BANNERS } from '../lib/mockData';

export const useBanners = () =>
  useQuery({
    queryKey: ['banners'],
    queryFn: async () => {
      try {
        const res = await api.get('/api/diner/banners');
        return res.data.banners;
      } catch {
        return MOCK_BANNERS;
      }
    },
    staleTime: 60 * 60 * 1000,
  });
