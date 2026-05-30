import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/authApi';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    try {
      const res = await register(email, password);
      const data = res.data.content || res.data;
      setSuccess(data.message || 'Solicitud enviada. Un administrador debe aprobar tu cuenta.');
      setTimeout(() => navigate('/login'), 4000);
    } catch (err) {
      const code = err.response?.data?.errorCode;
      const msg = err.response?.data?.message
        || err.response?.data?.error
        || 'No se pudo completar el registro';
      if (code === 'AUTH_EMAIL_ALREADY_REGISTERED') {
        setError('Ese correo ya está registrado');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      <div className="login-hero">
        <div className="login-hero__inner">
          <div className="login-hero__logo" aria-hidden />
          <h2>Solicita acceso a PaqueTrack</h2>
          <p>
            Tu cuenta quedará pendiente hasta que un administrador con rol ADMIN la apruebe.
          </p>
        </div>
      </div>
      <div className="login-panel">
        <div className="login-card">
          <div className="login-card__header">
            <h1>Crear cuenta</h1>
            <p>Registro con aprobación administrativa</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="reg-email">Correo</label>
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operador@logistics.com"
                autoComplete="email"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="reg-password">Contraseña</label>
              <input
                id="reg-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                required
                minLength={8}
              />
            </div>
            <div className="form-group">
              <label htmlFor="reg-confirm">Confirmar contraseña</label>
              <input
                id="reg-confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                required
                minLength={8}
              />
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Enviando…' : 'Solicitar registro'}
            </button>
          </form>
          <div className="login-card__footer">
            <p>
              ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
