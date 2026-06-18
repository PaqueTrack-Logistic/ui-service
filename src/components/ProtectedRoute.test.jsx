import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import { AuthProvider } from '../context/AuthContext'

function makeToken(payload) {
  const e = (o) => btoa(JSON.stringify(o))
  return `${e({ alg: 'HS256' })}.${e(payload)}.s`
}
const FUTURE = Math.floor(Date.now() / 1000) + 3600

function renderAt(initial) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initial]}>
        <Routes>
          <Route path="/login" element={<div>Pantalla Login</div>} />
          <Route
            path="/privado"
            element={<ProtectedRoute><div>Contenido Privado</div></ProtectedRoute>}
          />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  )
}

describe('ProtectedRoute (guard de autenticación)', () => {
  beforeEach(() => sessionStorage.clear())

  it('sin sesión redirige a /login', () => {
    renderAt('/privado')
    expect(screen.getByText('Pantalla Login')).toBeInTheDocument()
    expect(screen.queryByText('Contenido Privado')).not.toBeInTheDocument()
  })

  it('con sesión válida muestra el contenido protegido', () => {
    sessionStorage.setItem('accessToken', makeToken({
      sub: 'u', email: 'a@e.com', roles: ['ROLE_ADMIN'], exp: FUTURE,
    }))
    renderAt('/privado')
    expect(screen.getByText('Contenido Privado')).toBeInTheDocument()
  })
})
