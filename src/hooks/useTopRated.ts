import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import { QUERY_KEYS } from '../lib/constants';
import { useLocationStore } from '../store/locationStore';
import type { Restaurant } from '../types/restaurant';

export const useTopRated = () => {
  const locationId = useLocationStore((s) => s.selected?.id);
  return useQuery<Restaurant[]>({
    queryKey: [QUERY_KEYS.topRated, locationId],
    queryFn: async () => {
      const params = locationId ? { location_id: locationId } : {};
      const res = await api.get('/restaurants/top-rated', { params });
      return res.data.data;
    },
  });
};
