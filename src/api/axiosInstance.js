import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

// ── Factory ────────────────────────────────────────────────────────────────
function createApiClient(baseURL) {
  const client = axios.create({
    baseURL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
  });

  // REQUEST — attach JWT
  // client.interceptors.request.use(
  //   (config) => {
  //     const token = useAuthStore.getState().token;
  //     if (token) config.headers.Authorization = `Bearer ${token}`;
  //     return config;
  //   },
  //   (error) => Promise.reject(error)
  // );

  // RESPONSE — handle 401 globally
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
      const message =
        error.response?.data?.message ||
        error.response?.data?.title ||
        error.message ||
        'An unexpected error occurred';
      return Promise.reject(new Error(message));
    }
  );

  return client;
}

// ── Service Clients ────────────────────────────────────────────────────────
export const authApi  = createApiClient(import.meta.env.VITE_AUTH_API_URL  || 'http://localhost:5001');
export const mouldApi = createApiClient(import.meta.env.VITE_MOULD_API_URL || 'https://moldapi.larcherp.com');
