import axios from 'axios';
import { SCOPE_DENIED_MESSAGE } from './constants';

interface ApiErrorBody {
  error?: string;
  details?: unknown;
}

/**
 * Turn an unknown thrown value (typically an AxiosError) into a user-facing
 * message. A 403 on a brand operation is surfaced as the scope-denied copy;
 * otherwise the backend's `{ error }` message is used, then a generic fallback.
 */
export function getErrorMessage(
  err: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (axios.isAxiosError(err)) {
    if (err.response?.status === 403) return SCOPE_DENIED_MESSAGE;
    const body = err.response?.data as ApiErrorBody | undefined;
    if (body && typeof body.error === 'string' && body.error) return body.error;
    if (err.message) return err.message;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
