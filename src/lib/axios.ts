import axios from 'axios';
import { API_BASE } from './constants';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('onroute-auth');
  if (raw) {
    try {
      const { state } = JSON.parse(raw);
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    } catch { /* noop */ }
  }
  return config;
});

export default api;
