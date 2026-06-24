import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import { QUERY_KEYS } from '../lib/constants';
import { useLocationStore } from '../store/locationStore';
import type { Banner } from '../types/banner';

export const useBanners = () => {
  const locationId = useLocationStore((s) => s.selected?.id);
  return useQuery<Banner[]>({
    queryKey: [QUERY_KEYS.banners, locationId],
    queryFn: async () => {
      const params = locationId ? { location_id: locationId } : {};
      const res = await api.get('/banners', { params });
      return res.data.data;
    },
  });
};
