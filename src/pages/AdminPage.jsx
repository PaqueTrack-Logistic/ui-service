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

  return (
    <div className="page">
      <div className="page-header">
        <h1>Panel de Administracion</h1>
        <p>Estadisticas del sistema (requiere ROLE_ADMIN)</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {stats ? (
        <div className="card">
          <div className="card-header"><h3>Usuarios por Rol</h3></div>
          <div className="card-body">
            <pre className="json-display">{JSON.stringify(stats, null, 2)}</pre>
          </div>
        </div>
      ) : (
        !error && <p>Cargando estadisticas...</p>
      )}
    </div>
  );
}
