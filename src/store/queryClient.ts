import { QueryClient } from '@tanstack/react-query';

/**
 * Shared TanStack Query client.
 * - retry once on failure (avoids hammering the API on real errors)
 * - sensible staleTime so navigating between tabs doesn't refetch constantly
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000, // 30s
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
