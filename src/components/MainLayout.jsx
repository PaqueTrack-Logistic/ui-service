import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppSidebar from './AppSidebar';

export default function MainLayout({ children }) {
  const { user, loading } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (mobileNavOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setMobileNavOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileNavOpen]);

  if (loading) {
    return (
      <div className="app-loading" role="status" aria-live="polite">
        <span className="app-loading__spinner" aria-hidden />
        <span className="app-loading__text">Cargando sesión…</span>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="app-shell">
      <header className="app-mobile-header">
        <button
          type="button"
          className="app-mobile-header__menu"
          aria-expanded={mobileNavOpen}
          aria-controls="app-sidebar-nav"
          aria-label={mobileNavOpen ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setMobileNavOpen((o) => !o)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            {mobileNavOpen ? (
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            ) : (
              <>
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
        <span className="app-mobile-header__title">PaqueTrack</span>
      </header>

      <button
        type="button"
        className={`app-nav-backdrop ${mobileNavOpen ? 'app-nav-backdrop--visible' : ''}`}
        aria-label="Cerrar menú de navegación"
        tabIndex={mobileNavOpen ? 0 : -1}
        onClick={() => setMobileNavOpen(false)}
      />

      <AppSidebar
        id="app-sidebar-nav"
        className={`app-sidebar ${mobileNavOpen ? 'app-sidebar--open' : ''}`}
        onNavigate={() => setMobileNavOpen(false)}
      />
      <div className="app-content">
        <div className="app-content__inner">{children}</div>
      </div>
    </div>
  );
}
