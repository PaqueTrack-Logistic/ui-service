import httpClient from './httpClient';

const BASE = import.meta.env.VITE_API_GATEWAY_URL;

export const registerEvent = (shipmentId, data) =>
  httpClient.post(`${BASE}/api/tracking/${shipmentId}/events`, data);

export const getHistory = (shipmentId, { page = 0, size = 20 } = {}) => {
  return httpClient.get(`${BASE}/api/tracking/${shipmentId}/history`, {
    params: { page, size },
  });
};

export const getCurrentStatus = (shipmentId) =>
  httpClient.get(`${BASE}/api/tracking/${shipmentId}/current`);
