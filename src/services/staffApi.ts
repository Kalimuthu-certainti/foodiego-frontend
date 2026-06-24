import http from './http';
import type { Mapping, InviteStaffInput } from '../types';

/** GET /restaurant-users?brandId= -> Mapping[]. */
export async function listByBrand(brandId: string): Promise<Mapping[]> {
  const { data } = await http.get<Mapping[]>('/restaurant-users', {
    params: { brandId },
  });
  return data;
}

/** POST /restaurant-users { userId, role, brandId, restaurantId?, branchId?, phone } -> Mapping. */
export async function invite(input: InviteStaffInput): Promise<Mapping> {
  const { data } = await http.post<Mapping>('/restaurant-users', input);
  return data;
}

/** DELETE /restaurant-users/:id -> 204. */
export async function remove(id: string): Promise<void> {
  await http.delete(`/restaurant-users/${id}`);
}
