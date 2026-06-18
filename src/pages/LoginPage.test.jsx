import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

// Mock de useNavigate (hoisted para usarlo dentro de vi.mock)
const mockNavigate = vi.hoisted(() => vi.fn())
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useNavigate: () => mockNavigate }
})
vi.mock('../api/authApi', () => ({ login: vi.fn() }))

import { login } from '../api/authApi'
import LoginPage from './LoginPage'
import { AuthProvider } from '../context/AuthContext'

function renderLogin() {
  return render(
    <AuthProvider>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </AuthProvider>
  )
}

describe('LoginPage (prueba funcional del formulario de login)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
  })

  it('login exitoso: llama al API, guarda el token y navega a /', async () => {
    // JWT VÁLIDO: AuthContext.loginUser parsea el token; si no fuese parseable
    // limpiaría sessionStorage. Con un JWT real se conserva (flujo de producción).
    const enc = (o) => btoa(JSON.stringify(o))
    const token = `${enc({ alg: 'HS256' })}.${enc({
      sub: 'u1', email: 'admin@logistics.com', roles: ['ROLE_ADMIN'],
      exp: Math.floor(Date.now() / 1000) + 3600,
    })}.firma`
    login.mockResolvedValue({ data: { accessToken: token, refreshToken: 'rt-1' } })
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText('Contraseña'), 'password')
    await user.click(screen.getByRole('button', { name: /entrar al panel/i }))

    expect(login).toHaveBeenCalledWith('admin@logistics.com', 'password')
    expect(mockNavigate).toHaveBeenCalledWith('/')
    expect(sessionStorage.getItem('accessToken')).toBe(token)
    expect(sessionStorage.getItem('refreshToken')).toBe('rt-1')
  })

  it('credenciales inválidas: muestra el mensaje de error y no navega', async () => {
    login.mockRejectedValue({ response: { data: { message: 'Credenciales inválidas' } } })
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText('Contraseña'), 'malisima')
    await user.click(screen.getByRole('button', { name: /entrar al panel/i }))

    expect(await screen.findByText('Credenciales inválidas')).toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
