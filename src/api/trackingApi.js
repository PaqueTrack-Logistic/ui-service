import httpClient from './httpClient';

const BASE = import.meta.env.VITE_API_GATEWAY_URL || import.meta.env.VITE_TRACKING_URL;

export const registerEvent = (shipmentId, data) =>
  httpClient.post(`${BASE}/api/tracking/${shipmentId}/events`, data);

export const getHistory = (shipmentId) =>
  httpClient.get(`${BASE}/api/tracking/${shipmentId}/history`);

export const getCurrentStatus = (shipmentId) =>
  httpClient.get(`${BASE}/api/tracking/${shipmentId}/current`);
