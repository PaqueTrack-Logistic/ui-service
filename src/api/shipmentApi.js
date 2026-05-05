import httpClient from './httpClient';

const BASE = import.meta.env.VITE_API_GATEWAY_URL || import.meta.env.VITE_SHIPMENT_URL;

export const createShipment = (data) =>
  httpClient.post(`${BASE}/api/shipments`, data);

export const getShipmentById = (id) =>
  httpClient.get(`${BASE}/api/shipments/${id}`);

export const getShipmentByTracking = (trackingId) =>
  httpClient.get(`${BASE}/api/shipments/tracking/${trackingId}`);

export const searchShipments = ({ senderName, recipientName, page = 1, pageSize = 10 }) => {
  const params = new URLSearchParams();
  if (senderName) params.append('senderName', senderName);
  if (recipientName) params.append('recipientName', recipientName);
  params.append('page', page);
  params.append('pageSize', pageSize);
  return httpClient.get(`${BASE}/api/shipments/search?${params.toString()}`);
};