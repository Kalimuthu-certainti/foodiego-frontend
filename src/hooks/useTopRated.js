import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import { MOCK_RESTAURANTS } from '../lib/mockData';
import { useLocationStore } from '../store/locationStore';

export const useTopRated = () => {
  const coords = useLocationStore((s) => s.coords);
  return useQuery({
    queryKey: ['topRated', coords?.lat, coords?.lng],
    queryFn: async () => {
      try {
        const res = await api.get('/api/diner/restaurants/top-rated', {
          params: { lat: coords.lat, lng: coords.lng, limit: 10 },
        });
        return res.data.restaurants;
      } catch {
        return [...MOCK_RESTAURANTS].sort((a, b) => b.rating - a.rating);
      }
    },
    enabled: !!coords,
    staleTime: 5 * 60 * 1000,
  });
};
