import { useState } from 'react';
import { getShipmentsReport } from '../api/shipmentApi';

const normalizeReportDate = (value) => {
  if (!value) return '';
  const isoPattern = /^\d{4}-\d{2}-\d{2}$/;
  if (isoPattern.test(value)) return value;
  const localPattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = value.match(localPattern);
  if (match) return `${match[3]}-${match[2]}-${match[1]}`;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString().slice(0, 10);
};

const STATUS_SECTIONS = [
  { key: 'created',        label: 'Creados',       badge: 'badge-created',  icon: 'ti-circle-dot',    dot: '#378ADD' },
  { key: 'inTransit',      label: 'En tránsito',   badge: 'badge-transit',  icon: 'ti-truck',         dot: '#EF9F27' },
  { key: 'outForDelivery', label: 'En reparto',     badge: 'badge-delivery', icon: 'ti-map-pin',       dot: '#7F77DD' },
  { key: 'delivered',      label: 'Entregados',     badge: 'badge-delivered',icon: 'ti-circle-check',  dot: '#639922' },
  { key: 'exception',      label: 'Con excepción',  badge: 'badge-exception',icon: 'ti-alert-triangle',dot: '#E24B4A' },
];

const METRIC_CONFIG = [
  { key: 'totalCreated',        label: 'Creados',       color: '#185FA5', dot: '#378ADD' },
  { key: 'totalInTransit',      label: 'En tránsito',   color: '#854F0B', dot: '#EF9F27' },
  { key: 'totalOutForDelivery', label: 'En reparto',     color: '#534AB7', dot: '#7F77DD' },
  { key: 'totalDelivered',      label: 'Entregados',     color: '#3B6D11', dot: '#639922' },
  { key: 'totalException',      label: 'Con excepción',  color: '#A32D2D', dot: '#E24B4A' },
];

export default function LogisticsReportPage() {
  const today   = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [from, setFrom]       = useState(weekAgo);
  const [to, setTo]           = useState(today);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [report, setReport]   = useState(null);

  const handleSearch = async (e) => {
    e && e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const normalizedFrom = normalizeReportDate(from);
      const normalizedTo   = normalizeReportDate(to);
      const res  = await getShipmentsReport({ from: normalizedFrom, to: normalizedTo });
      const data = res.data?.content ?? res.data;
      setReport(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al obtener el reporte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">

      {/* ─── Encabezado ─────────────────────────────────────────── */}
      <div className="page-header">
        <p className="page-header__eyebrow">Reportes</p>
        <h1>Reporte de envíos</h1>
        <p>Volumen operativo por estado en un rango de fechas seleccionado.</p>
      </div>

      {/* ─── Formulario ─────────────────────────────────────────── */}
      <div className="card">
        <div className="card-header">
          <h3>Seleccionar período</h3>
        </div>
        <form className="report-form" onSubmit={handleSearch}>
          <div className="form-row">
            <div className="form-group">
              <label>Fecha inicio</label>
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Fecha fin</label>
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Cargando…' : 'Consultar'}
            </button>
          </div>
        </form>
        {error && <div className="alert alert-error" style={{ marginTop: '.875rem' }}>{error}</div>}
      </div>

      {/* ─── Resultados ─────────────────────────────────────────── */}
      {report && (
        <>
          {/* Métricas + barra de distribución */}
          <div className="card" style={{ marginTop: '1rem' }}>
            <div className="card-header">
              <h3>Resumen — {report.from} al {report.to}</h3>
            </div>

            <div className="metrics-grid">
              {METRIC_CONFIG.map(({ key, label, color, dot }) => (
                <div className="metric-card" key={key}>
                  <div className="metric-card__dot" style={{ background: dot }} />
                  <div className="metric-card__label">{label}</div>
                  <div className="metric-card__value" style={{ color }}>{report[key]}</div>
                </div>
              ))}
            </div>

            <div className="total-bar" style={{ marginTop: '1rem' }}>
              <span className="total-bar__label">Total de envíos en el período</span>
              <span className="total-bar__value">{report.totalGeneral}</span>
            </div>

            {report.totalGeneral > 0 && (
              <div className="progress-wrap" style={{ marginTop: '1rem' }}>
                <div className="progress-track">
                  {METRIC_CONFIG.map(({ key, dot }) => {
                    const pct = ((report[key] / report.totalGeneral) * 100).toFixed(1);
                    return pct > 0
                      ? <div key={key} className="progress-seg" style={{ width: `${pct}%`, background: dot }} />
                      : null;
                  })}
                </div>
                <div className="progress-legend">
                  {METRIC_CONFIG.map(({ key, label, dot }) => (
                    <span key={key} className="progress-legend__item">
                      <span className="progress-legend__dot" style={{ background: dot }} />
                      {label} {((report[key] / report.totalGeneral) * 100).toFixed(0)}%
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Detalle por estado */}
          <div className="card" style={{ marginTop: '1rem' }}>
            <div className="card-header">
              <h3>Detalle por estado</h3>
            </div>

            {report.totalGeneral === 0 ? (
              <p className="empty-state">No hay envíos en el rango seleccionado.</p>
            ) : (
              STATUS_SECTIONS.map(({ key, label, badge, icon }) =>
                report[key]?.length > 0 && (
                  <div key={key} className="status-section">
                    <div className="status-section__header">
                      <span className={`status-badge ${badge}`}>
                        <i className={`ti ${icon}`} aria-hidden="true" />
                        {label}
                      </span>
                      <span className="count-pill">{report[key].length} envíos</span>
                    </div>
                    <table className="detail-table">
                      <thead>
                        <tr>
                          <th>Guía</th>
                          <th>Remitente</th>
                          <th>Destinatario</th>
                          <th>Origen</th>
                          <th>Destino</th>
                          <th>Peso kg</th>
                          <th>Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report[key].map((s) => (
                          <tr key={s.id}>
                            <td><code className="code-chip">{s.trackingId}</code></td>
                            <td>{s.senderName}</td>
                            <td>{s.recipientName}</td>
                            <td>{s.senderCity}</td>
                            <td>{s.recipientCity}</td>
                            <td>{s.weightKg}</td>
                            <td>{s.createdAt ? s.createdAt.slice(0, 10) : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}
