import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getHistory, registerEvent } from '../api/trackingApi';

const PAGE_SIZE = 20;

const EVENT_TYPES = [
  { name: 'DISPATCHED',             targetStatus: 'IN_TRANSIT' },
  { name: 'ARRIVED_AT_HUB',         targetStatus: 'AT_TRANSIT_POINT' },
  { name: 'DEPARTED_FROM_HUB',      targetStatus: 'IN_TRANSIT' },
  { name: 'ARRIVED_AT_TERMINAL',    targetStatus: 'AT_TRANSIT_POINT' },
  { name: 'DEPARTED_FROM_TERMINAL', targetStatus: 'IN_TRANSIT' },
  { name: 'OUT_FOR_DELIVERY',       targetStatus: 'OUT_FOR_DELIVERY' },
  { name: 'DELIVERED',              targetStatus: 'DELIVERED' },
  { name: 'DAMAGED',                targetStatus: 'EXCEPTION' },
];

function formatDate(iso) {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
}

function toISOLocal(value) {
  if (!value) return null;
  return new Date(value).toISOString();
}

function nowLocalValue() {
  const now = new Date();
  now.setSeconds(0, 0);
  return now.toISOString().slice(0, 16);
}

export default function TrackingPage() {
  const [searchParams] = useSearchParams();

  const [shipmentId, setShipmentId] = useState(searchParams.get('id') || '');
  const [inputId, setInputId]       = useState(searchParams.get('id') || '');

  // --- historial ---
  const [history, setHistory]               = useState([]);
  const [page, setPage]                     = useState(0);
  const [totalPages, setTotalPages]         = useState(1);
  const [totalElements, setTotalElements]   = useState(0);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError]     = useState('');

  // --- registro de evento ---
  const [eventForm, setEventForm] = useState({
    eventType:  EVENT_TYPES[0].name,
    location:   '',
    occurredAt: nowLocalValue(),
  });
  const [loadingEvent, setLoadingEvent] = useState(false);
  const [eventSuccess, setEventSuccess] = useState('');
  const [eventError, setEventError]     = useState('');

  const selectedEvent = EVENT_TYPES.find((e) => e.name === eventForm.eventType);

  const fetchHistory = useCallback(async (id, pageNum) => {
    if (!id?.trim()) return;
    setLoadingHistory(true);
    setHistoryError('');
    try {
      const res  = await getHistory(id.trim(), { page: pageNum, size: PAGE_SIZE });
      const data = res.data;
      setHistory(data.content || []);
      setTotalPages(data.totalPages ?? 1);
      setTotalElements(data.totalElements ?? 0);
      setPage(pageNum);
    } catch (err) {
      setHistoryError(
        err.response?.status === 404
          ? 'No se encontró un envío con ese ID.'
          : err.response?.data?.error || 'Error al obtener el historial.'
      );
      setHistory([]);
      setTotalPages(1);
      setTotalElements(0);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (!shipmentId) return;

    let isCanceled = false;
    Promise.resolve().then(() => {
      if (!isCanceled) {
        fetchHistory(shipmentId, 0);
      }
    });

    return () => {
      isCanceled = true;
    };
  }, [shipmentId, fetchHistory]);

  const handleSearch = (e) => {
    e.preventDefault();
    const id = inputId.trim();
    setShipmentId(id);
    setPage(0);
    setHistory([]);
    setHistoryError('');
    fetchHistory(id, 0);
  };

  const handleEventChange = (e) => {
    setEventForm({ ...eventForm, [e.target.name]: e.target.value });
  };

  const handleRegisterEvent = async (e) => {
    e.preventDefault();
    if (!shipmentId) return;
    setLoadingEvent(true);
    setEventError('');
    setEventSuccess('');
    try {
      await registerEvent(shipmentId, {
        eventType:  eventForm.eventType,
        location:   eventForm.location.trim(),
        occurredAt: toISOLocal(eventForm.occurredAt),
      });
      setEventSuccess(`Evento "${eventForm.eventType}" registrado correctamente.`);
      fetchHistory(shipmentId, 0);
    } catch (err) {
      setEventError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Error al registrar el evento.'
      );
    } finally {
      setLoadingEvent(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <p className="page-header__eyebrow">Tracking</p>
        <h1>Seguimiento de envíos</h1>
        <p>Consulte el historial de eventos o registre uno nuevo para un envío.</p>
      </div>

      {/* Buscador */}
      <div className="card">
        <div className="card-header"><h3>Consultar envío</h3></div>
        <div className="card-body">
          <form onSubmit={handleSearch}>
            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="tracking-input">ID de envío (UUID interno)</label>
                <input
                  id="tracking-input"
                  value={inputId}
                  onChange={(e) => setInputId(e.target.value)}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  required
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loadingHistory}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {loadingHistory ? 'Buscando…' : 'Ver historial'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Contenido principal — visible solo cuando hay shipmentId */}
      {shipmentId && (
        <div className="two-columns" style={{ marginTop: '1.5rem' }}>

          {/* Registrar evento */}
          <div className="card">
            <div className="card-header"><h3>Registrar evento</h3></div>
            <div className="card-body">
              <form onSubmit={handleRegisterEvent}>

                <div className="form-group">
                  <label>Tipo de evento</label>
                  <select
                    name="eventType"
                    value={eventForm.eventType}
                    onChange={handleEventChange}
                    required
                  >
                    {EVENT_TYPES.map((et) => (
                      <option key={et.name} value={et.name}>
                        {et.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedEvent && (
                  <div style={{
                    background: 'var(--muted, #f4f4f5)',
                    borderRadius: '6px',
                    padding: '0.5rem 0.75rem',
                    marginBottom: '1rem',
                    fontSize: '0.85rem',
                    color: 'var(--muted-foreground, #666)',
                  }}>
                    Estado resultante:{' '}
                    <span className={`status status-${selectedEvent.targetStatus.toLowerCase()}`}>
                      {selectedEvent.targetStatus}
                    </span>
                  </div>
                )}

                <div className="form-group">
                  <label>Ubicación</label>
                  <input
                    name="location"
                    value={eventForm.location}
                    onChange={handleEventChange}
                    placeholder="Ej: Bodega Medellín Norte"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Fecha y hora del evento</label>
                  <input
                    type="datetime-local"
                    name="occurredAt"
                    value={eventForm.occurredAt}
                    onChange={handleEventChange}
                    required
                  />
                </div>

                {eventError   && <div className="alert alert-error">{eventError}</div>}
                {eventSuccess && <div className="alert alert-success">{eventSuccess}</div>}

                <button
                  type="submit"
                  className="btn btn-primary btn-full"
                  disabled={loadingEvent}
                >
                  {loadingEvent ? 'Registrando…' : 'Registrar evento'}
                </button>
              </form>
            </div>
          </div>

          {/* Historial */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Historial de eventos</h3>
              {totalElements > 0 && (
                <span style={{ fontSize: '0.85rem', color: 'var(--muted-foreground, #888)' }}>
                  {totalElements} evento{totalElements !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="card-body" style={{ padding: 0 }}>

              {historyError && (
                <div className="alert alert-error" style={{ margin: '1rem' }}>
                  {historyError}
                </div>
              )}

              {loadingHistory && (
                <p style={{ padding: '1rem', color: 'var(--muted-foreground, #888)' }}>Cargando…</p>
              )}

              {!historyError && !loadingHistory && history.length === 0 && (
                <p style={{ padding: '1rem', color: 'var(--muted-foreground, #888)' }}>
                  Sin eventos registrados aún.
                </p>
              )}

              {history.length > 0 && (
                <>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="detail-table" style={{ width: '100%', marginTop: 0 }}>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Tipo de evento</th>
                          <th>Antes</th>
                          <th>Después</th>
                          <th>Ubicación</th>
                          <th>Fecha / Hora</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((ev, idx) => (
                          <tr key={ev.id}>
                            <td style={{ color: 'var(--muted-foreground, #888)', fontSize: '0.8rem' }}>
                              {page * PAGE_SIZE + idx + 1}
                            </td>
                            <td><strong>{ev.eventType || '—'}</strong></td>
                            <td>
                              {ev.statusBefore
                                ? <span className={`status status-${ev.statusBefore.toLowerCase()}`}>{ev.statusBefore}</span>
                                : <span style={{ color: 'var(--muted-foreground,#888)' }}>—</span>}
                            </td>
                            <td>
                              {ev.statusAfter
                                ? <span className={`status status-${ev.statusAfter.toLowerCase()}`}>{ev.statusAfter}</span>
                                : <span style={{ color: 'var(--muted-foreground,#888)' }}>—</span>}
                            </td>
                            <td>{ev.location || '—'}</td>
                            <td style={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                              {formatDate(ev.occurredAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {totalPages > 1 && (
                    <div
                      className="shipment-actions"
                      style={{ justifyContent: 'space-between', padding: '1rem 1.25rem' }}
                    >
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        disabled={page <= 0 || loadingHistory}
                        onClick={() => fetchHistory(shipmentId, page - 1)}
                      >
                        ← Anterior
                      </button>
                      <span style={{ fontSize: '0.9rem' }}>
                        Página {page + 1} de {totalPages}
                      </span>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        disabled={page >= totalPages - 1 || loadingHistory}
                        onClick={() => fetchHistory(shipmentId, page + 1)}
                      >
                        Siguiente →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
