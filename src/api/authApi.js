import httpClient from './httpClient';

const BASE = import.meta.env.VITE_API_GATEWAY_URL;

export const login = (email, password) =>
  httpClient.post(`${BASE}/api/auth/login`, { email, password });

export const register = (email, password) =>
  httpClient.post(`${BASE}/api/auth/register`, { email, password });

export const refresh = (refreshToken) =>
  httpClient.post(`${BASE}/api/auth/refresh`, { refreshToken });

export const getMe = () =>
  httpClient.get(`${BASE}/api/auth/me`);

export const getAdminStats = () =>
  httpClient.get(`${BASE}/api/auth/admin/stats/users-by-role`);

export const getPendingUsers = () =>
  httpClient.get(`${BASE}/api/auth/admin/users/pending`);

export const getAssignableRoles = () =>
  httpClient.get(`${BASE}/api/auth/admin/users/assignable-roles`);

export const approveUser = (userId, role) =>
  httpClient.post(`${BASE}/api/auth/admin/users/${userId}/approve`, { role });

export const rejectUser = (userId) =>
  httpClient.post(`${BASE}/api/auth/admin/users/${userId}/reject`);
