import axios from 'axios';
import type { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { getAccess, getRefresh, setTokens, clearTokens } from '../store/authStore';
import type { RefreshResponse } from '../types';

const BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:4000/api';

/** Shared axios instance. Per-domain api files import this. */
export const http = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach the bearer access token ──
http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccess();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: refresh once on 401, else clear + redirect ──

interface RetryConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

/** Bare axios call for refresh so it does not loop through the interceptors. */
async function requestNewAccessToken(refreshToken: string): Promise<string> {
  const res = await axios.post<RefreshResponse>(`${BASE_URL}/auth/refresh`, {
    refreshToken,
  });
  return res.data.accessToken;
}

function redirectToLogin(): void {
  clearTokens();
  if (typeof window === 'undefined') return;
  // Respect the Vite base path ("/foodiego-frontend/" on GitHub Pages, "/" in dev)
  // so this hard redirect keeps the subpath instead of 404-ing at the account root.
  const loginPath = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/login`;
  if (window.location.pathname !== loginPath) {
    window.location.assign(loginPath);
  }
}

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined;
    const status = error.response?.status;

    if (status === 401 && original && !original._retry) {
      original._retry = true;
      const refresh = getRefresh();
      if (!refresh) {
        redirectToLogin();
        return Promise.reject(error);
      }
      try {
        const accessToken = await requestNewAccessToken(refresh);
        setTokens(accessToken);
        original.headers = original.headers ?? {};
        (original.headers as Record<string, string>).Authorization = `Bearer ${accessToken}`;
        return http.request(original);
      } catch (refreshError) {
        redirectToLogin();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default http;
