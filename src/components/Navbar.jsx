import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">PaqueTrack</Link>
      </div>
      <div className="navbar-links">
        <Link to="/">Inicio</Link>
        <Link to="/shipments">Envios</Link>
        <Link to="/tracking">Tracking</Link>
        {isAdmin && <Link to="/admin">Admin</Link>}
      </div>
      <div className="navbar-user">
        <span className="user-email">{user.email}</span>
        <span className="user-role">{user.roles?.[0]}</span>
        <button onClick={handleLogout} className="btn-logout">Salir</button>
      </div>
    </nav>
  );
}
