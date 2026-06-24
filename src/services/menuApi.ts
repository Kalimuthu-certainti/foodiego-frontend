import http from './http';
import type {
  Brand,
  MenuChangeRequest,
  MenuSubmissionInput,
  CreateMenuChangeRequestInput,
} from '../types';

/** POST /brands/:id/menu-submission { items } -> Brand (menu_locked=true). */
export async function submit(brandId: string, input: MenuSubmissionInput): Promise<Brand> {
  const { data } = await http.post<Brand>(`/brands/${brandId}/menu-submission`, input);
  return data;
}

/** POST /menu-change-requests { brandId, items, reason? } -> MenuChangeRequest. */
export async function createChangeRequest(
  input: CreateMenuChangeRequestInput,
): Promise<MenuChangeRequest> {
  const { data } = await http.post<MenuChangeRequest>('/menu-change-requests', input);
  return data;
}

/** GET /menu-change-requests?brandId= -> MenuChangeRequest[]. */
export async function listChangeRequests(brandId: string): Promise<MenuChangeRequest[]> {
  const { data } = await http.get<MenuChangeRequest[]>('/menu-change-requests', {
    params: { brandId },
  });
  return data;
}
