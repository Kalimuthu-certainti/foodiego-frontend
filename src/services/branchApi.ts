import http from './http';
import type { Branch, CreateBranchInput } from '../types';

/** GET /branches?restaurantId= -> Branch[]. */
export async function listByRestaurant(restaurantId: string): Promise<Branch[]> {
  const { data } = await http.get<Branch[]>('/branches', {
    params: { restaurantId },
  });
  return data;
}

/** POST /branches { restaurantId, name, lat, lng, workingHours } -> Branch. */
export async function create(input: CreateBranchInput): Promise<Branch> {
  const { data } = await http.post<Branch>('/branches', input);
  return data;
}
