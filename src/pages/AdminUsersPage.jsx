import { useState, useEffect, useCallback } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { getPendingUsers, getAssignableRoles, approveUser, rejectUser } from '../api/authApi';
import { useAuth } from '../context/useAuth';

function unwrapPending(payload) {
  const body = payload?.content ?? payload;
  const users = body?.users ?? body;
  return Array.isArray(users) ? users : [];
}

function unwrapRoles(payload) {
  const body = payload?.content ?? payload;
  const roles = body?.roles ?? body;
  return Array.isArray(roles) ? roles : [];
}

function formatRoleLabel(role) {
  return role?.replace(/^ROLE_/, '') || role;
}

export default function AdminUsersPage() {
  const { isAdmin } = useAuth();
  const [pending, setPending] = useState([]);
  const [assignableRoles, setAssignableRoles] = useState(['ROLE_OPERATOR', 'ROLE_ADMIN']);
  const [roleByUserId, setRoleByUserId] = useState({});
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);

  const initRoleSelections = useCallback((users, roles) => {
    const defaultRole = roles.includes('ROLE_OPERATOR') ? 'ROLE_OPERATOR' : roles[0];
    const next = {};
    users.forEach((u) => {
      const provisional = u.roles?.[0];
      next[u.id] = roles.includes(provisional) ? provisional : defaultRole;
    });
    setRoleByUserId(next);
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    Promise.all([getPendingUsers(), getAssignableRoles()])
      .then(([pendingRes, rolesRes]) => {
        const users = unwrapPending(pendingRes.data);
        const roles = unwrapRoles(rolesRes.data);
        const roleList = roles.length > 0 ? roles : ['ROLE_OPERATOR', 'ROLE_ADMIN'];
        if (roles.length > 0) setAssignableRoles(roles);
        setPending(users);
        initRoleSelections(users, roleList);
      })
      .catch((err) => setError(err.response?.data?.message || 'Error al cargar solicitudes'))
      .finally(() => setLoading(false));
  }, [initRoleSelections]);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  if (!isAdmin) return <Navigate to="/" replace />;

  const handleApprove = async (userId) => {
    const role = roleByUserId[userId];
    if (!role) {
      setError('Selecciona un rol antes de aprobar');
      return;
    }
    setActingId(userId);
    setMessage('');
    setError('');
    try {
      await approveUser(userId, role);
      setMessage(`Usuario aprobado con rol ${formatRoleLabel(role)}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al aprobar');
    } finally {
      setActingId(null);
    }
  };

  const handleReject = async (userId) => {
    setActingId(userId);
    setMessage('');
    try {
      await rejectUser(userId);
      setMessage('Solicitud rechazada');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al rechazar');
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <p className="page-header__eyebrow">Administración</p>
        <h1>Solicitudes de registro</h1>
        <p>Aprueba o rechaza nuevos usuarios. Al aprobar, debes elegir el rol que tendrá en el sistema.</p>
        <p className="text-muted">
          <Link to="/admin">← Volver al panel admin</Link>
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      {loading ? (
        <p className="text-muted">Cargando solicitudes…</p>
      ) : pending.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <p className="text-muted">No hay solicitudes pendientes.</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header"><h3>Pendientes ({pending.length})</h3></div>
          <div className="card-body">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Correo</th>
                  <th>Solicitud</th>
                  <th>Rol provisional</th>
                  <th>Rol a asignar</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((u) => (
                  <tr key={u.id}>
                    <td>{u.email}</td>
                    <td>{u.createdAt ? new Date(u.createdAt).toLocaleString() : '—'}</td>
                    <td>{u.roles?.map(formatRoleLabel).join(', ') || '—'}</td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={roleByUserId[u.id] ?? 'ROLE_OPERATOR'}
                        disabled={actingId === u.id}
                        onChange={(e) =>
                          setRoleByUserId((prev) => ({ ...prev, [u.id]: e.target.value }))
                        }
                        aria-label={`Rol para ${u.email}`}
                      >
                        {assignableRoles.map((r) => (
                          <option key={r} value={r}>
                            {formatRoleLabel(r)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="data-table__actions">
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        disabled={actingId === u.id}
                        onClick={() => handleApprove(u.id)}
                      >
                        Aprobar
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        disabled={actingId === u.id}
                        onClick={() => handleReject(u.id)}
                      >
                        Rechazar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
