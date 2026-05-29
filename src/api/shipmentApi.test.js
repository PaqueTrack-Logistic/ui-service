import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('./httpClient', () => ({
  default: {
    post: vi.fn(() => Promise.resolve({ data: {} })),
    get: vi.fn(() => Promise.resolve({ data: {} })),
  },
}))

import httpClient from './httpClient'
import { createShipment, getShipmentById, getShipmentByTracking, searchShipments } from './shipmentApi'

describe('shipmentApi - rutas (caja negra)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('createShipment hace POST a /api/shipments con el payload', () => {
    const data = { senderName: 'Ana', weightKg: 2 }
    createShipment(data)
    expect(httpClient.post).toHaveBeenCalledWith(expect.stringContaining('/api/shipments'), data)
  })

  it('getShipmentById hace GET a /api/shipments/{id}', () => {
    getShipmentById('abc-1')
    expect(httpClient.get).toHaveBeenCalledWith(expect.stringContaining('/api/shipments/abc-1'))
  })

  it('getShipmentByTracking hace GET a /api/shipments/tracking/{trackingId}', () => {
    getShipmentByTracking('PQ-20260101-ABCDEF')
    expect(httpClient.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/shipments/tracking/PQ-20260101-ABCDEF')
    )
  })

  it('searchShipments por senderName arma el query string', () => {
    searchShipments({ senderName: 'Ana' })
    const url = httpClient.get.mock.calls[0][0]
    expect(url).toContain('/api/shipments/search?')
    expect(url).toContain('senderName=Ana')
    expect(url).toContain('page=1')
    expect(url).toContain('pageSize=10')
  })

  it('searchShipments por recipientName incluye solo ese parámetro', () => {
    searchShipments({ recipientName: 'Luis' })
    const url = httpClient.get.mock.calls[0][0]
    expect(url).toContain('recipientName=Luis')
    expect(url).not.toContain('senderName=')
  })
})
