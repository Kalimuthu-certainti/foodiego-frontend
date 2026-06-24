import axios from 'axios';
import { API_BASE } from './constants';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  // Check friend's auth store first (OTP flow), fall back to Zustand persist store
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  } else {
    try {
      const raw = localStorage.getItem('onroute-auth');
      if (raw) {
        const { state } = JSON.parse(raw);
        if (state?.token) config.headers.Authorization = `Bearer ${state.token}`;
      }
    } catch { /* noop */ }
  }
  return config;
});

export default api;
