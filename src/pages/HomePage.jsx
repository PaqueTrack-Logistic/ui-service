import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { user, isAdmin } = useAuth();

  const services = [
    {
      name: 'Auth Service',
      port: '8080',
      status: 'JWT + RBAC',
      endpoints: ['POST /login', 'POST /refresh', 'GET /me'],
      swagger: `${import.meta.env.VITE_AUTH_URL}/swagger-ui.html`,
    },
    {
      name: 'Shipment Service',
      port: '8081',
      status: 'Envíos',
      endpoints: ['POST /api/shipments', 'GET /{id}', 'GET /tracking/{id}'],
      swagger: `${import.meta.env.VITE_SHIPMENT_URL}/swagger-ui.html`,
    },
    {
      name: 'Tracking Service',
      port: '8082',
      status: 'Eventos',
      endpoints: ['POST /{id}/events', 'GET /{id}/history', 'GET /{id}/current'],
      swagger: `${import.meta.env.VITE_TRACKING_URL}/swagger-ui.html`,
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <p className="page-header__eyebrow">Resumen operativo</p>
        <h1>Panel de control</h1>
        <p>
          Hola, <strong>{user.email}</strong>
          <span className="badge" style={{ marginLeft: '0.5rem', verticalAlign: 'middle' }}>{user.roles?.[0]?.replace(/^ROLE_/, '') || 'Usuario'}</span>
        </p>
        <p className="page-kicker">
          <span className="pill-live">Sistema en línea</span>
          · Documentación Swagger por servicio
        </p>
      </div>

      <div className="cards-grid">
        {services.map((svc) => (
          <div key={svc.name} className="card">
            <div className="card-header">
              <h3>{svc.name}</h3>
              <div className="svc-card__meta">
                <span className="badge badge-info">:{svc.port}</span>
              </div>
            </div>
            <div className="card-body">
              <p className="card-subtitle">{svc.status}</p>
              <ul className="endpoint-list">
                {svc.endpoints.map((ep) => (
                  <li key={ep}><code>{ep}</code></li>
                ))}
              </ul>
            </div>
            <div className="card-footer">
              <a href={svc.swagger} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                Abrir Swagger
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="info-section">
        <h2>Flujo del sistema</h2>
        <div className="flow-steps">
          <div className="flow-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <strong>Login</strong>
              <p>POST /api/auth/login → JWT + refresh token</p>
            </div>
          </div>
          <div className="flow-arrow" aria-hidden>→</div>
          <div className="flow-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <strong>Crear envío</strong>
              <p>POST /api/shipments → tracking ID (PQ-…)</p>
            </div>
          </div>
          <div className="flow-arrow" aria-hidden>→</div>
          <div className="flow-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <strong>RabbitMQ</strong>
              <p>shipment.created → tracking-service</p>
            </div>
          </div>
          <div className="flow-arrow" aria-hidden>→</div>
          <div className="flow-step">
            <div className="step-number">4</div>
            <div className="step-content">
              <strong>Tracking</strong>
              <p>Registrar eventos → historial completo</p>
            </div>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="info-section" style={{ marginTop: '1.25rem' }}>
          <p className="badge badge-admin">Acceso administrador · estadísticas en /admin</p>
        </div>
      )}
    </div>
  );
}
