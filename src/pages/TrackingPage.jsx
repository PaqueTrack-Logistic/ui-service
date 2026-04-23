import { useState } from 'react';
import { getHistory, getCurrentStatus, registerEvent } from '../api/trackingApi';

const EVENT_TYPES = [
  { value: 'DISPATCHED', label: 'DISPATCHED (Despachado → En Transito)' },
  { value: 'OUT_FOR_DELIVERY', label: 'OUT_FOR_DELIVERY (En Reparto)' },
  { value: 'DELIVERED', label: 'DELIVERED (Entregado)' },
];

export default function TrackingPage() {
  const [shipmentId, setShipmentId] = useState('');
  const [history, setHistory] = useState([]);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  const [eventForm, setEventForm] = useState({
    eventType: EVENT_TYPES[0].value,
    location: '',
  });
  const [eventResult, setEventResult] = useState('');
  const [eventError, setEventError] = useState('');

  const loadTracking = async (e) => {
    e.preventDefault();
    setError('');
    setHistory([]);
    setCurrentStatus(null);
    setLoaded(false);
    try {
      const [histRes, statusRes] = await Promise.all([
        getHistory(shipmentId),
        getCurrentStatus(shipmentId),
      ]);
      setHistory(histRes.data);
      setCurrentStatus(statusRes.data);
      setLoaded(true);
    } catch (err) {
      setError(err.response?.status === 404 ? 'Envio no encontrado en tracking' : 'Error al consultar');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setEventError('');
    setEventResult('');
    try {
      const res = await registerEvent(shipmentId, {
        ...eventForm,
        occurredAt: new Date().toISOString().replace('Z', ''),
      });
      const corrId = res.headers['x-correlation-id'] || 'N/A';
      setEventResult(`Evento aceptado (HTTP 202). Correlation-Id: ${corrId}`);
      setTimeout(async () => {
        try {
          const [h, s] = await Promise.all([getHistory(shipmentId), getCurrentStatus(shipmentId)]);
          setHistory(h.data);
          setCurrentStatus(s.data);
        } catch { /* ignore refresh error */ }
      }, 2000);
    } catch (err) {
      setEventError(err.response?.data?.message || err.response?.data?.error || 'Error al registrar evento');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      CREATED: '#3498db',
      IN_TRANSIT: '#f39c12',
      OUT_FOR_DELIVERY: '#e67e22',
      DELIVERED: '#27ae60',
      EXCEPTION: '#e74c3c',
    };
    return colors[status] || '#666';
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Tracking de Envios</h1>
        <p>Consultar historial y registrar eventos de seguimiento</p>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-body">
          <form onSubmit={loadTracking} className="search-inline">
            <div className="form-group" style={{ flex: 1 }}>
              <label>Shipment ID (UUID)</label>
              <input
                value={shipmentId}
                onChange={(e) => setShipmentId(e.target.value)}
                placeholder="ej: 4ff2a911-5a9e-4fd9-8f84-d9f6f020f66f"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">Cargar Tracking</button>
          </form>
          {error && <div className="alert alert-error">{error}</div>}
        </div>
      </div>

      {loaded && (
        <div className="two-columns">
          <div className="card">
            <div className="card-header">
              <h3>Timeline de Eventos</h3>
              {currentStatus && (
                <span className="badge" style={{ backgroundColor: getStatusColor(currentStatus.status) }}>
                  {currentStatus.status}
                </span>
              )}
            </div>
            <div className="card-body">
              {history.length === 0 ? (
                <p className="text-muted">No hay eventos registrados</p>
              ) : (
                <div className="timeline">
                  {history.map((event, i) => (
                    <div key={event.id || i} className="timeline-item">
                      <div className="timeline-dot" style={{ backgroundColor: getStatusColor(event.statusAfter) }} />
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <strong>{event.eventType}</strong>
                          <span className="timeline-time">
                            {new Date(event.occurredAt).toLocaleString('es-CO')}
                          </span>
                        </div>
                        <p className="timeline-detail">
                          {event.statusBefore} → {event.statusAfter}
                        </p>
                        {event.location && <p className="timeline-location">{event.location}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3>Registrar Evento</h3></div>
            <div className="card-body">
              <form onSubmit={handleRegister}>
                <div className="form-group">
                  <label>Tipo de Evento</label>
                  <select
                    value={eventForm.eventType}
                    onChange={(e) => setEventForm({ ...eventForm, eventType: e.target.value })}
                  >
                    {EVENT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Ubicacion</label>
                  <input
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    placeholder="Centro de distribucion Bogota"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-full">Registrar Evento</button>
              </form>
              {eventResult && <div className="alert alert-success">{eventResult}</div>}
              {eventError && <div className="alert alert-error">{eventError}</div>}
              <div className="info-box">
                <p><strong>Nota:</strong> El evento se procesa de forma asincrona via RabbitMQ.
                  El timeline se actualiza automaticamente despues de 2 segundos.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
