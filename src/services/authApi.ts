import http from './http';
import type { LoginInput, LoginResponse, RefreshResponse } from '../types';

/** POST /auth/login -> { accessToken, refreshToken, user }. */
export async function login(input: LoginInput): Promise<LoginResponse> {
  const { data } = await http.post<LoginResponse>('/auth/login', input);
  return data;
}

/** POST /auth/refresh -> { accessToken }. */
export async function refresh(refreshToken: string): Promise<RefreshResponse> {
  const { data } = await http.post<RefreshResponse>('/auth/refresh', { refreshToken });
  return data;
}
