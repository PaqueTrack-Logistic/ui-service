import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../api/authApi';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@logistics.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(email, password);
      const data = res.data.content || res.data;
      loginUser(data.accessToken, data.refreshToken);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message
        || err.response?.data?.error
        || 'Error de autenticacion';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
<<<<<<< HEAD
    <div className="login-root">
      <div className="login-hero">
        <div className="login-hero__inner">
          <div className="login-hero__logo" aria-hidden />
          <h2>Visibilidad de punta a punta para su cadena logística</h2>
          <p>
            Autenticación JWT, envíos, eventos y trazabilidad en tiempo casi real. Un solo panel para operar y auditar.
          </p>
          <div className="login-hero__stats">
            <div className="login-stat">
              <strong>3</strong>
              <span>Servicios API</span>
            </div>
            <div className="login-stat">
              <strong>RabbitMQ</strong>
              <span>Eventos asíncronos</span>
            </div>
            <div className="login-stat">
              <strong>RBAC</strong>
              <span>Roles y auditoría</span>
            </div>
          </div>
        </div>
      </div>
      <div className="login-panel">
        <div className="login-card">
          <div className="login-card__header">
            <h1>Iniciar sesión</h1>
            <p>PaqueTrack · acceso seguro al panel de operaciones</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="login-email">Correo</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@logistics.com"
                autoComplete="username"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="login-password">Contraseña</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Ingresando…' : 'Entrar al panel'}
            </button>
          </form>
          <div className="login-card__footer">
            <p>Uso interno · JWT access + refresh según política del auth service</p>
          </div>
=======
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>PaqueTrack</h1>
          <p>Sistema de Tracking Logistico</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@logistics.com"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
            />
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Ingresando...' : 'Iniciar Sesion'}
          </button>
        </form>
        <div className="login-footer">
          <p>                         </p>
>>>>>>> ecf40e9156bd359678e40ebe478c482862a63c49
        </div>
      </div>
    </div>
  );
}
