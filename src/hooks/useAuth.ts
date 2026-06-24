import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authApi from '../services/authApi';
import { setTokens, clearTokens, decodeUser, type DecodedUser } from '../store/authStore';

export interface UseAuth {
  /** Current user decoded from the access token, or null when signed out. */
  user: DecodedUser | null;
  /** True when a valid access token is present. */
  isAuthenticated: boolean;
  /** Authenticate with credentials, store tokens, and navigate home. */
  login: (email: string, password: string) => Promise<void>;
  /** Clear tokens and return to the login screen. */
  logout: () => void;
}

/**
 * Auth hook wiring authApi + authStore + router navigation.
 * Token state lives in localStorage (authStore); this hook derives the current
 * user on each render so it stays in sync after login/logout.
 */
export function useAuth(): UseAuth {
  const navigate = useNavigate();

  const user = useMemo<DecodedUser | null>(() => decodeUser(), []);

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      const res = await authApi.login({ email, password });
      setTokens(res.accessToken, res.refreshToken);
      navigate('/', { replace: true });
    },
    [navigate],
  );

  const logout = useCallback((): void => {
    clearTokens();
    navigate('/login', { replace: true });
  }, [navigate]);

  return {
    user,
    isAuthenticated: user !== null,
    login,
    logout,
  };
}
