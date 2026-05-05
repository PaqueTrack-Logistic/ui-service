import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const nav = [
  { to: '/', label: 'Inicio', icon: 'M4 6h16M4 12h16M4 18h7' },
  { to: '/shipments', label: 'Envíos', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { to: '/tracking', label: 'Tracking', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
];

function IconPath({ d }) {
  return (
    <svg className="app-sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

export default function AppSidebar({ id, className = 'app-sidebar', onNavigate }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleNav = () => {
    onNavigate?.();
  };

  const handleLogout = () => {
    onNavigate?.();
    logout();
    navigate('/login');
  };

  return (
    <aside id={id} className={className} aria-label="Navegación principal">
      <div className="app-sidebar__brand">
        <div className="app-sidebar__logo" aria-hidden />
        <div>
          <span className="app-sidebar__title">PaqueTrack</span>
          <span className="app-sidebar__tagline">Operaciones · Tracking</span>
        </div>
      </div>

      <nav className="app-sidebar__nav">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `app-sidebar__link ${isActive ? 'app-sidebar__link--active' : ''}`}
            onClick={handleNav}
          >
            <IconPath d={item.icon} />
            {item.label}
          </NavLink>
        ))}
        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) => `app-sidebar__link ${isActive ? 'app-sidebar__link--active' : ''}`}
            onClick={handleNav}
          >
            <IconPath d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            Admin
          </NavLink>
        )}
      </nav>

      <div className="app-sidebar__footer">
        <div className="app-sidebar__user">
          <div className="app-sidebar__avatar" aria-hidden>{(user.email || '?').charAt(0).toUpperCase()}</div>
          <div className="app-sidebar__user-meta">
            <span className="app-sidebar__email">{user.email}</span>
            <span className="app-sidebar__role">{user.roles?.[0]?.replace(/^ROLE_/, '') || 'Usuario'}</span>
          </div>
        </div>
        <button type="button" className="app-sidebar__logout" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
