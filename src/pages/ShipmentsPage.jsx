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

  // ── Historial ──────────────────────────────────────────────
  const [historyInput, setHistoryInput]     = useState(searchParams.get('id') || '');
  const [historyId, setHistoryId]           = useState(searchParams.get('id') || '');
  const [history, setHistory]               = useState([]);
  const [page, setPage]                     = useState(0);
  const [totalPages, setTotalPages]         = useState(1);
  const [totalElements, setTotalElements]   = useState(0);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError]     = useState('');

  // ── Registro de evento ─────────────────────────────────────
  const [eventId, setEventId]       = useState('');
  const [eventForm, setEventForm]   = useState({
    eventType:  EVENT_TYPES[0].name,
    location:   '',
    occurredAt: nowLocalValue(),
  });
  const [loadingEvent, setLoadingEvent] = useState(false);
  const [eventSuccess, setEventSuccess] = useState('');
  const [eventError, setEventError]     = useState('');

  const selectedEvent = EVENT_TYPES.find((e) => e.name === eventForm.eventType);

  // ── Fetch historial ────────────────────────────────────────
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
    if (!historyId) return;

    let isCanceled = false;
    Promise.resolve().then(() => {
      if (!isCanceled) {
        fetchHistory(historyId, 0);
      }
    });

    return () => {
      isCanceled = true;
    };
  }, [historyId, fetchHistory]);

  const handleHistorySearch = (e) => {
    e.preventDefault();
    const id = historyInput.trim();
    setHistoryId(id);
    setPage(0);
    setHistory([]);
    setHistoryError('');
    fetchHistory(id, 0);
  };

  // ── Registro evento ────────────────────────────────────────
  const handleEventChange = (e) => {
    setEventForm({ ...eventForm, [e.target.name]: e.target.value });
  };

  const handleRegisterEvent = async (e) => {
    e.preventDefault();
    if (!eventId.trim()) return;
    setLoadingEvent(true);
    setEventError('');
    setEventSuccess('');
    try {
      await registerEvent(eventId.trim(), {
        eventType:  eventForm.eventType,
        location:   eventForm.location.trim(),
        occurredAt: toISOLocal(eventForm.occurredAt),
      });
      setEventSuccess(`Evento "${eventForm.eventType}" registrado correctamente.`);
      setEventForm({ eventType: EVENT_TYPES[0].name, location: '', occurredAt: nowLocalValue() });
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
        <p>Consulte el historial de eventos de un envío o registre uno nuevo.</p>
      </div>

      {/* ── Card 1: Historial ── */}
      <div className="card">
        <div className="card-header"><h3>Historial de eventos</h3></div>
        <div className="card-body">
          <form onSubmit={handleHistorySearch}>
            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="history-input">ID de envío (UUID interno)</label>
                <input
                  id="history-input"
                  value={historyInput}
                  onChange={(e) => setHistoryInput(e.target.value)}
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

          {historyError && (
            <div className="alert alert-error" style={{ marginTop: '1rem' }}>
              {historyError}
            </div>
          )}

          {loadingHistory && (
            <p style={{ marginTop: '1rem', color: 'var(--muted-foreground, #888)' }}>Cargando…</p>
          )}

          {!historyError && !loadingHistory && historyId && history.length === 0 && (
            <p style={{ marginTop: '1rem', color: 'var(--muted-foreground, #888)' }}>
              Sin eventos registrados aún.
            </p>
          )}

          {history.length > 0 && (
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--muted-foreground, #888)' }}>
                  {totalElements} evento{totalElements !== 1 ? 's' : ''} en total
                </span>
              </div>
              <div style={{ overflowX: 'auto', marginTop: '0.5rem' }}>
                <table className="detail-table detail-table--fixed" style={{ width: '100%', marginTop: 0}}>
                  <colgroup>
                    <col style={{ width: '6%' }} />
                    <col style={{ width: '24%' }} />
                    <col style={{ width: '18%' }} />
                    <col style={{ width: '18%' }} />
                    <col style={{ width: '20%' }} />
                    <col style={{ width: '20%' }} />
                  </colgroup>
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
                  style={{ justifyContent: 'space-between', marginTop: '1rem' }}
                >
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    disabled={page <= 0 || loadingHistory}
                    onClick={() => fetchHistory(historyId, page - 1)}
                  >
                    ← Anterior
                  </button>
                  <span style={{ fontSize: '0.9rem' }}>Página {page + 1} de {totalPages}</span>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    disabled={page >= totalPages - 1 || loadingHistory}
                    onClick={() => fetchHistory(historyId, page + 1)}
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Card 2: Registrar evento ── */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header"><h3>Registrar evento</h3></div>
        <div className="card-body">
          <form onSubmit={handleRegisterEvent}>
            <div className="form-group">
              <label htmlFor="event-shipment-id">ID de envío (UUID interno)</label>
              <input
                id="event-shipment-id"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label>Tipo de evento</label>
                <select
                  name="eventType"
                  value={eventForm.eventType}
                  onChange={handleEventChange}
                  required
                >
                  {EVENT_TYPES.map((et) => (
                    <option key={et.name} value={et.name}>{et.name}</option>
                  ))}
                </select>
              </div>

              {selectedEvent && (
                <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '0.1rem' }}>
                  <div style={{
                    background: 'var(--muted, #f4f4f5)',
                    borderRadius: '6px',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.85rem',
                    color: 'var(--muted-foreground, #666)',
                    whiteSpace: 'nowrap',
                  }}>
                    Estado resultante:{' '}
                    <span className={`status status-${selectedEvent.targetStatus.toLowerCase()}`}>
                      {selectedEvent.targetStatus}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label>Ubicación</label>
                <input
                  name="location"
                  value={eventForm.location}
                  onChange={handleEventChange}
                  placeholder="Ej: Bodega Medellín Norte"
                  required
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Fecha y hora del evento</label>
                <input
                  type="datetime-local"
                  name="occurredAt"
                  value={eventForm.occurredAt}
                  onChange={handleEventChange}
                  required
                />
              </div>
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

    </div>
  );
}