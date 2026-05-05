import { useState, useEffect } from 'react';
import { getAdminStats } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

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

  const statEntries =
    stats && typeof stats === 'object' && !Array.isArray(stats)
      ? Object.entries(stats)
      : null;

  return (
    <div className="page">
      <div className="page-header">
        <p className="page-header__eyebrow">Administración</p>
        <h1>Panel de administración</h1>
        <p>Estadísticas del ecosistema (requiere ROLE_ADMIN).</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {statEntries && statEntries.length > 0 ? (
        <div className="card">
          <div className="card-header"><h3>Usuarios por rol</h3></div>
          <div className="card-body">
            <div className="stats-grid">
              {statEntries.map(([key, val]) => (
                <div key={key} className="stat-card">
                  <div className="stat-card__key">{key.replace(/^ROLE_/, '')}</div>
                  <div className="stat-card__val">{String(val)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : stats != null ? (
        <div className="card">
          <div className="card-header"><h3>Respuesta</h3></div>
          <div className="card-body">
            <pre className="json-display">{JSON.stringify(stats, null, 2)}</pre>
          </div>
        </div>
      ) : (
        !error && <p className="text-muted">Cargando estadísticas…</p>
      )}
    </div>
  );
}
