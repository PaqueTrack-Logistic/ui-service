import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('./httpClient', () => ({
  default: {
    post: vi.fn(() => Promise.resolve({ data: {} })),
    get: vi.fn(() => Promise.resolve({ data: {} })),
  },
}))

import httpClient from './httpClient'
import { registerEvent, getHistory, getCurrentStatus } from './trackingApi'

describe('trackingApi - rutas (caja negra)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('registerEvent hace POST a /api/tracking/{id}/events', () => {
    const data = { eventType: 'DISPATCHED', location: 'Hub' }
    registerEvent('ship-1', data)
    expect(httpClient.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/tracking/ship-1/events'),
      data
    )
  })

  it('getHistory hace GET a /history con paginación por defecto', () => {
    getHistory('ship-1')
    expect(httpClient.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/tracking/ship-1/history'),
      { params: { page: 0, size: 20 } }
    )
  })

  it('getHistory respeta page/size personalizados', () => {
    getHistory('ship-1', { page: 2, size: 5 })
    expect(httpClient.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/tracking/ship-1/history'),
      { params: { page: 2, size: 5 } }
    )
  })

  it('getCurrentStatus hace GET a /current', () => {
    getCurrentStatus('ship-1')
    expect(httpClient.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/tracking/ship-1/current')
    )
  })
})
