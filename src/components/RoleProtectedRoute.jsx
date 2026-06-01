import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function RoleProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading">Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const roles = user.roles || [];
  const ok = allowedRoles.length === 0 || allowedRoles.some(r => roles.includes(r));
  if (!ok) return <Navigate to="/" replace />;

  return children;
}
