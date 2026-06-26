import http from './http';
import type { Review, ReviewFilters, ReviewSummary, ReviewsResponse } from '../types';

/** GET /reviews/summary → rating summary for the caller's brand. */
export async function summary(): Promise<ReviewSummary> {
  const { data } = await http.get<ReviewSummary>('/reviews/summary');
  return data;
}

/** GET /reviews → paginated review list for the caller's brand. */
export async function list(filters: ReviewFilters = {}): Promise<ReviewsResponse> {
  const params: Record<string, string | number> = {};
  if (filters.branch_id) params.branch_id = filters.branch_id;
  if (filters.rating)    params.rating    = filters.rating;
  if (filters.status)    params.status    = filters.status;
  if (filters.from)      params.from      = filters.from;
  if (filters.to)        params.to        = filters.to;
  if (filters.search)    params.search    = filters.search;
  if (filters.page)      params.page      = filters.page;
  if (filters.limit)     params.limit     = filters.limit;

  const { data } = await http.get<ReviewsResponse>('/reviews', { params });
  return data;
}

/** POST /reviews/:id/reply → post first reply to a review. */
export async function postReply(id: string, replyText: string): Promise<Review> {
  const { data } = await http.post<Review>(`/reviews/${id}/reply`, { reply_text: replyText });
  return data;
}

/** PUT /reviews/:id/reply → edit an existing reply. */
export async function updateReply(id: string, replyText: string): Promise<Review> {
  const { data } = await http.put<Review>(`/reviews/${id}/reply`, { reply_text: replyText });
  return data;
}
