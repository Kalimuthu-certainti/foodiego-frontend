// Token + current-user store backed by localStorage. No React state here — the
// authoritative source of the access/refresh tokens used by the axios interceptor.
import type { Role } from '../types';

const ACCESS_KEY = 'fg_access';
const REFRESH_KEY = 'fg_refresh';

export function getAccess(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefresh(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(access: string, refresh?: string): void {
  localStorage.setItem(ACCESS_KEY, access);
  if (refresh !== undefined) localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export interface DecodedUser {
  id: string;
  role: Role;
  email?: string;
}

/** Decode the JWT payload (no verification) into the current user, or null. */
export function decodeUser(): DecodedUser | null {
  const token = getAccess();
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeBase64(payload);
    const data = JSON.parse(json) as {
      id?: string;
      sub?: string;
      role?: Role;
      email?: string;
    };
    const id = data.id ?? data.sub;
    if (!id || !data.role) return null;
    return { id, role: data.role, email: data.email };
  } catch {
    return null;
  }
}

function decodeBase64(input: string): string {
  const padded = input.padEnd(input.length + ((4 - (input.length % 4)) % 4), '=');
  if (typeof atob === 'function') {
    const binary = atob(padded);
    try {
      const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
      return new TextDecoder().decode(bytes);
    } catch {
      return binary;
    }
  }
  // Node / SSR fallback (no DOM atob). Reached via globalThis so this file does
  // not require @types/node in the browser build.
  const nodeBuffer = (
    globalThis as {
      Buffer?: { from(data: string, encoding: string): { toString(encoding: string): string } };
    }
  ).Buffer;
  if (nodeBuffer) return nodeBuffer.from(padded, 'base64').toString('utf-8');
  return padded;
}
