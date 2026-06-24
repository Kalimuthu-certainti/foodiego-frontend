import http from './http';

/** A single row that failed validation/import, as returned by the bulk module. */
export interface BulkUploadRowError {
  row: number;
  error: string;
}

/** Result of POST /bulk-upload/upload (the `data` field of the API envelope). */
export interface BulkUploadResult {
  jobId: string;
  importId?: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  importedRows: number;
  skippedRows: number;
  failedRecordCount: number;
  errors: BulkUploadRowError[];
}

/** The bulk module wraps every response as { success, message, data, errors }. */
interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Upload a CSV/Excel menu file to the bulk-upload module.
 * The restaurant is auto-registered server-side from id + name, so any of the
 * owner's restaurants works. Axios sets the multipart boundary for FormData.
 */
export async function upload(params: {
  restaurantId: string;
  restaurantName: string;
  file: File;
}): Promise<BulkUploadResult> {
  const form = new FormData();
  form.append('file', params.file);
  form.append('restaurant_id', params.restaurantId);
  form.append('restaurant_name', params.restaurantName);

  const { data } = await http.post<ApiEnvelope<BulkUploadResult>>(
    '/bulk-upload/upload',
    form,
  );
  return data.data;
}
