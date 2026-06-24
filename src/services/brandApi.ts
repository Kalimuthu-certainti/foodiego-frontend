import http from './http';
import type { Brand, CreateBrandInput, UpdateBrandInput } from '../types';

/** GET /brands -> Brand[]. */
export async function list(): Promise<Brand[]> {
  const { data } = await http.get<Brand[]>('/brands');
  return data;
}

/** GET /brands/:id -> Brand. */
export async function get(id: string): Promise<Brand> {
  const { data } = await http.get<Brand>(`/brands/${id}`);
  return data;
}

/** POST /brands { name } -> Brand. */
export async function create(input: CreateBrandInput): Promise<Brand> {
  const { data } = await http.post<Brand>('/brands', input);
  return data;
}

/** PATCH /brands/:id { name? } -> Brand. */
export async function update(id: string, input: UpdateBrandInput): Promise<Brand> {
  const { data } = await http.patch<Brand>(`/brands/${id}`, input);
  return data;
}

/** DELETE /brands/:id -> 204. */
export async function remove(id: string): Promise<void> {
  await http.delete(`/brands/${id}`);
}
