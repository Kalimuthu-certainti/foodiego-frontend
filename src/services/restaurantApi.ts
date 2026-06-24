import http from './http';
import type { Restaurant, CreateRestaurantInput } from '../types';

/** GET /restaurants?brandId= -> Restaurant[]. */
export async function listByBrand(brandId: string): Promise<Restaurant[]> {
  const { data } = await http.get<Restaurant[]>('/restaurants', {
    params: { brandId },
  });
  return data;
}

/** POST /restaurants { brandId, name, gstNo, email, phone } -> Restaurant. */
export async function create(input: CreateRestaurantInput): Promise<Restaurant> {
  const { data } = await http.post<Restaurant>('/restaurants', input);
  return data;
}
