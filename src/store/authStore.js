import { create } from 'zustand';

export const useAuthStore = create((set, get) => ({
  isLoggedIn: false,
  diner: null,
  accessToken: null,
  setAuth: (diner, token) => set({ isLoggedIn: true, diner, accessToken: token }),
  clearAuth: () => set({ isLoggedIn: false, diner: null, accessToken: null }),
  getDinerName: () => get().diner?.name ?? 'Guest',
}));
