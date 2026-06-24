import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import { MOCK_RESTAURANTS } from '../lib/mockData';
import { useLocationStore } from '../store/locationStore';

export const useOffers = () => {
  const coords = useLocationStore((s) => s.coords);
  return useQuery({
    queryKey: ['offers', coords?.lat, coords?.lng],
    queryFn: async () => {
      try {
        const res = await api.get('/api/diner/restaurants/offers', {
          params: { lat: coords.lat, lng: coords.lng, limit: 10 },
        });
        return res.data.restaurants;
      } catch {
        return MOCK_RESTAURANTS.filter((r) => r.offerBadge);
      }
    },
    enabled: !!coords,
    staleTime: 5 * 60 * 1000,
  });
};
