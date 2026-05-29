import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AuthProvider } from './AuthContext'
import { useAuth } from './useAuth'

// Construye un JWT de prueba (header.payload.signature) con payload arbitrario
function makeToken(payload) {
  const enc = (o) => btoa(JSON.stringify(o))
  return `${enc({ alg: 'HS256' })}.${enc(payload)}.signature`
}
const FUTURE = Math.floor(Date.now() / 1000) + 3600
const PAST = Math.floor(Date.now() / 1000) - 3600

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>

describe('AuthContext / useAuth (caja blanca: parseo JWT, expiración, roles)', () => {
  beforeEach(() => sessionStorage.clear())
  afterEach(() => sessionStorage.clear())

  it('sin token en sessionStorage -> user null', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.user).toBeNull()
    expect(result.current.isAdmin).toBeFalsy()
  })

  it('token válido (ROLE_ADMIN) -> hidrata user e isAdmin true', () => {
    sessionStorage.setItem('accessToken', makeToken({
      sub: 'u1', email: 'admin@logistics.com', roles: ['ROLE_ADMIN'], exp: FUTURE,
    }))
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.user).toMatchObject({ id: 'u1', email: 'admin@logistics.com' })
    expect(result.current.isAdmin).toBe(true)
  })

  it('token expirado -> user null y limpia sessionStorage', () => {
    sessionStorage.setItem('accessToken', makeToken({ sub: 'u1', email: 'x@e.com', roles: [], exp: PAST }))
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.user).toBeNull()
    expect(sessionStorage.getItem('accessToken')).toBeNull()
  })

  it('token malformado -> user null (parseJwt devuelve null)', () => {
    sessionStorage.setItem('accessToken', 'esto-no-es-un-jwt')
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.user).toBeNull()
  })

  it('loginUser guarda tokens y setea user (ROLE_OPERATOR -> isAdmin false); logout limpia', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    act(() => result.current.loginUser(
      makeToken({ sub: 'u2', email: 'op@e.com', roles: ['ROLE_OPERATOR'], exp: FUTURE }), 'rt-1'))
    expect(result.current.user.email).toBe('op@e.com')
    expect(result.current.isAdmin).toBeFalsy()
    expect(sessionStorage.getItem('refreshToken')).toBe('rt-1')

    act(() => result.current.logout())
    expect(result.current.user).toBeNull()
    expect(sessionStorage.getItem('accessToken')).toBeNull()
  })
})
