import { useAuth } from '../context/useAuth';

export default function HomePage() {
  const { user, isAdmin } = useAuth();

  const services = [
    {
      name: 'Auth Service',
      status: 'JWT + RBAC',
      endpoints: ['POST /login', 'POST /refresh', 'GET /me']
    },
    {
      name: 'Shipment Service',
      status: 'Envíos',
      endpoints: ['POST /api/shipments', 'GET /{id}', 'GET /tracking/{id}'],
    },
    {
      name: 'Tracking Service',
      status: 'Eventos',
      endpoints: ['POST /{id}/events', 'GET /{id}/history', 'GET /{id}/current']
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
            </div>
            <div className="card-body">
              <p className="card-subtitle">{svc.status}</p>
              <ul className="endpoint-list">
                {svc.endpoints?.map((ep) => (
                  <li key={ep}><code>{ep}</code></li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      

      {isAdmin && (
        <div className="info-section" style={{ marginTop: '1.25rem' }}>
          <p className="badge badge-admin">Acceso administrador · estadísticas en /admin</p>
        </div>
      )}
    </div>
  );
}
