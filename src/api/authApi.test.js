import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('./httpClient', () => ({
  default: {
    post: vi.fn(() => Promise.resolve({ data: {} })),
    get: vi.fn(() => Promise.resolve({ data: {} })),
  },
}))

import httpClient from './httpClient'
import { login, refresh, getMe, getAdminStats } from './authApi'

describe('authApi - rutas del gateway (caja negra)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('login hace POST a /api/auth/login con credenciales', () => {
    login('admin@logistics.com', 'secret')
    expect(httpClient.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/login'),
      { email: 'admin@logistics.com', password: 'secret' }
    )
  })

  it('refresh hace POST a /api/auth/refresh con el refreshToken', () => {
    refresh('rt-123')
    expect(httpClient.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/refresh'),
      { refreshToken: 'rt-123' }
    )
  })

  it('getMe hace GET a /api/auth/me', () => {
    getMe()
    expect(httpClient.get).toHaveBeenCalledWith(expect.stringContaining('/api/auth/me'))
  })

  it('getAdminStats hace GET a /api/auth/admin/stats/users-by-role', () => {
    getAdminStats()
    expect(httpClient.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/admin/stats/users-by-role')
    )
  })
})
