import http from './http';
import type { ReportRow, Payout, ReportQuery } from '../types';

/** GET /brands/:id/reports?from=&to= -> ReportRow[]. */
export async function reports(brandId: string, query: ReportQuery = {}): Promise<ReportRow[]> {
  const { data } = await http.get<ReportRow[]>(`/brands/${brandId}/reports`, {
    params: { from: query.from, to: query.to },
  });
  return data;
}

/** GET /brands/:id/payouts -> Payout[]. */
export async function payouts(brandId: string): Promise<Payout[]> {
  const { data } = await http.get<Payout[]>(`/brands/${brandId}/payouts`);
  return data;
}

/** GET /brands/:id/payouts?format=csv -> CSV text. */
export async function payoutsCsv(brandId: string): Promise<string> {
  const { data } = await http.get<string>(`/brands/${brandId}/payouts`, {
    params: { format: 'csv' },
    responseType: 'text',
  });
  return data;
}
