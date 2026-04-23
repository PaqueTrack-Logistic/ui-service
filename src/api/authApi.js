import httpClient from './httpClient';

const BASE = import.meta.env.VITE_API_GATEWAY_URL || import.meta.env.VITE_AUTH_URL;

export const login = (email, password) =>
  httpClient.post(`${BASE}/api/auth/login`, { email, password });

export const refresh = (refreshToken) =>
  httpClient.post(`${BASE}/api/auth/refresh`, { refreshToken });

export const getMe = () =>
  httpClient.get(`${BASE}/api/auth/me`);

export const getAdminStats = () =>
  httpClient.get(`${BASE}/api/auth/admin/stats/users-by-role`);
