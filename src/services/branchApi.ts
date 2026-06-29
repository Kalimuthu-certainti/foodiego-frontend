import http from './http';
import type { Branch, CreateBranchInput, UpdateBranchInput } from '../types';

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

/** PATCH /branches/:id { name?, lat?, lng?, workingHours? } -> Branch. */
export async function update(id: string, input: UpdateBranchInput): Promise<Branch> {
  const { data } = await http.patch<Branch>(`/branches/${id}`, input);
  return data;
}
