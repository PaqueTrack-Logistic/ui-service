import httpClient from './httpClient';

const BASE = import.meta.env.VITE_API_GATEWAY_URL || import.meta.env.VITE_SHIPMENT_URL;

export const createShipment = (data) =>
  httpClient.post(`${BASE}/api/shipments`, data);

export const getShipmentById = (id) =>
  httpClient.get(`${BASE}/api/shipments/${id}`);

export const getShipmentByTracking = (trackingId) =>
  httpClient.get(`${BASE}/api/shipments/tracking/${trackingId}`);
