import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import { QUERY_KEYS } from '../lib/constants';
import { useLocationStore } from '../store/locationStore';
import type { Restaurant } from '../types/restaurant';

export const useOffers = () => {
  const locationId = useLocationStore((s) => s.selected?.id);
  return useQuery<Restaurant[]>({
    queryKey: [QUERY_KEYS.offers, locationId],
    queryFn: async () => {
      const params: Record<string, string | number> = { has_offers: 'true' };
      if (locationId) params.location_id = locationId;
      const res = await api.get('/restaurants', { params });
      return res.data.data;
    },
  });
};
