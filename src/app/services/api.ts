import axios from 'axios';

// In production (Vercel): uses /api which is served by the serverless function.
// In development: proxied via vite.config.ts proxy to localhost:3001.
// VITE_API_URL can override for special environments, but should NOT be set
// in local .env if you want this auto-detection to work.
const API_URL = import.meta.env.VITE_API_URL ?? '/api';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de resposta: trata erros globais
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.message ||
      'Erro de conexão com o servidor';
    return Promise.reject(new Error(message));
  }
);

export default api;
