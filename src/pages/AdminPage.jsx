import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { getAdminStats } from '../api/authApi';
import { useAuth } from '../context/useAuth';

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAdmin) return;
    getAdminStats()
      .then((res) => setStats(res.data.content || res.data))
      .catch((err) => setError(err.response?.data?.message || 'Error al cargar estadisticas'));
  }, [isAdmin]);

  if (!isAdmin) return <Navigate to="/" replace />;

  const rows = Array.isArray(stats?.rows) ? stats.rows : [];

  return (
    <div className="page">
      <div className="page-header">
        <p className="page-header__eyebrow">Administración</p>
        <h1>Panel de administración</h1>
        <p>Estadísticas del ecosistema (requiere ROLE_ADMIN).</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="card-header"><h3>Gestión de usuarios</h3></div>
        <div className="card-body">
          <p>Revisa y aprueba solicitudes de registro de nuevos operadores.</p>
          <Link to="/admin/users" className="btn btn-primary">Solicitudes pendientes</Link>
        </div>
      </div>

      {stats != null ? (
        <div className="card">
          <div className="card-header"><h3>Usuarios por rol</h3></div>
          <div className="card-body">
            {rows.length > 0 ? (
              <div className="stats-grid">
                {rows.map(({ roleName, userCount }) => (
                  <div key={roleName} className="stat-card">
                    <div className="stat-card__key">{roleName.replace(/^ROLE_/, '')}</div>
                    <div className="stat-card__val">{userCount}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">No hay usuarios registrados por rol.</p>
            )}
          </div>
        </div>
      ) : (
        !error && <p className="text-muted">Cargando estadísticas…</p>
      )}
    </div>
  );
}
