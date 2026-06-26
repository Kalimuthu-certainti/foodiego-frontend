import http from './http';
import type { Order, OrderFilters, OrderSummary, OrdersResponse } from '../types';

/** GET /orders/summary → counts per status for the caller's brand. */
export async function summary(): Promise<OrderSummary> {
  const { data } = await http.get<OrderSummary>('/orders/summary');
  return data;
}

/** GET /orders → paginated order list for the caller's brand. */
export async function list(filters: OrderFilters = {}): Promise<OrdersResponse> {
  const params: Record<string, string | number> = {};
  if (filters.branch_id) params.branch_id = filters.branch_id;
  if (filters.status)    params.status    = filters.status;
  if (filters.from)      params.from      = filters.from;
  if (filters.to)        params.to        = filters.to;
  if (filters.search)    params.search    = filters.search;
  if (filters.page)      params.page      = filters.page;
  if (filters.limit)     params.limit     = filters.limit;

  const { data } = await http.get<OrdersResponse>('/orders', { params });
  return data;
}

/** GET /orders/:id → full order detail. */
export async function get(id: string): Promise<Order> {
  const { data } = await http.get<Order>(`/orders/${id}`);
  return data;
}

/** PUT /orders/:id/cancel → cancel a placed or confirmed order. */
export async function cancel(id: string, reason: string): Promise<Order> {
  const { data } = await http.put<Order>(`/orders/${id}/cancel`, { reason });
  return data;
}
