import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import { QUERY_KEYS } from '../lib/constants';
import { useFilterStore } from '../store/filterStore';
import { useLocationStore } from '../store/locationStore';
import type { Restaurant } from '../types/restaurant';

export const useRestaurants = () => {
  const { cuisine_id, search, sort, has_offers } = useFilterStore();
  const locationId = useLocationStore((s) => s.selected?.id);

  return useQuery<Restaurant[]>({
    queryKey: [QUERY_KEYS.restaurants, { cuisine_id, search, sort, has_offers, locationId }],
    queryFn: async () => {
      const params: Record<string, string | number | boolean> = {};
      if (cuisine_id) params.cuisine_id = cuisine_id;
      if (search) params.search = search;
      if (sort) params.sort = sort;
      if (has_offers) params.has_offers = true;
      if (locationId) params.location_id = locationId;
      const res = await api.get('/restaurants', { params });
      return res.data.data;
    },
  });
};
