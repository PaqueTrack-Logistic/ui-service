import httpClient from './httpClient';

const BASE = import.meta.env.VITE_API_GATEWAY_URL || import.meta.env.VITE_TRACKING_URL;

export const registerEvent = (shipmentId, data) =>
  httpClient.post(`${BASE}/api/tracking/${shipmentId}/events`, data);

<<<<<<< HEAD
export const getHistory = (shipmentId, { page = 0, size = 20 } = {}) => {
  return httpClient.get(`${BASE}/api/tracking/${shipmentId}/history`, {
    params: { page, size },
  });
};
=======
export const getHistory = (shipmentId) =>
  httpClient.get(`${BASE}/api/tracking/${shipmentId}/history`);
>>>>>>> ecf40e9156bd359678e40ebe478c482862a63c49

export const getCurrentStatus = (shipmentId) =>
  httpClient.get(`${BASE}/api/tracking/${shipmentId}/current`);
