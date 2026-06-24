import { useInfiniteQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import { MOCK_RESTAURANTS } from '../lib/mockData';
import { useLocationStore } from '../store/locationStore';
import { useFilterStore } from '../store/filterStore';

export const useRestaurants = () => {
  const coords = useLocationStore((s) => s.coords);
  const { cuisine, rating, price, vegOnly, sortBy } = useFilterStore();

  return useInfiniteQuery({
    queryKey: ['restaurants', coords?.lat, coords?.lng, { cuisine, rating, price, vegOnly, sortBy }],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const params = { lat: coords.lat, lng: coords.lng, page: pageParam, limit: 20 };
        if (cuisine) params.cuisine = cuisine;
        if (rating)  params.rating  = rating;
        if (price)   params.price   = price;
        if (vegOnly) params.vegOnly = true;
        if (sortBy && sortBy !== 'relevance') params.sortBy = sortBy;

        const res = await api.get('/api/diner/restaurants', { params });
        return res.data;
      } catch {
        if (pageParam === 1) {
          return {
            restaurants: MOCK_RESTAURANTS,
            total: MOCK_RESTAURANTS.length,
            currentPage: 1,
            totalPages: 1,
            nextPage: null,
            hasMore: false,
          };
        }
        throw new Error('Failed to fetch page');
      }
    },
    enabled: !!coords,
    staleTime: 2 * 60 * 1000,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextPage : undefined),
  });
};
