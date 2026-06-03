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

const STATUS_CONFIG = {
  created:       { label: 'Creados',        className: 'badge-created'  },
  inTransit:     { label: 'En tránsito',    className: 'badge-transit'  },
  outForDelivery:{ label: 'En reparto',     className: 'badge-delivery' },
  delivered:     { label: 'Entregados',     className: 'badge-delivered'},
  exception:     { label: 'Con excepción',  className: 'badge-exception'},
};

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
        <p>Consulte el volumen de envíos creados, en tránsito y entregados en un rango de fechas.</p>
      </div>

      {/* ─── Formulario ─────────────────────────────────────────── */}
      <div className="card">
        <div className="card-header">
          <h3>Rango de fechas</h3>
        </div>
        <form className="report-form" onSubmit={handleSearch}>
          <div className="form-row">
            <div className="form-group">
              <label>Desde</label>
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Hasta</label>
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Cargando…' : 'Consultar'}
            </button>
          </div>
        </form>
        {error && <div className="alert alert-error" style={{ marginTop: '1rem' }}>{error}</div>}
      </div>

      {/* ─── Resultados ─────────────────────────────────────────── */}
      {report && (
        <>
          {/* Métricas */}
          <div className="card" style={{ marginTop: '1rem' }}>
            <div className="card-header">
              <h3>Resumen — {report.from} al {report.to}</h3>
            </div>
            <div className="metrics-grid">
              <MetricCard label="Creados"        value={report.totalCreated}        color="blue"   />
              <MetricCard label="En tránsito"    value={report.totalInTransit}      color="amber"  />
              <MetricCard label="En reparto"     value={report.totalOutForDelivery} color="purple" />
              <MetricCard label="Entregados"     value={report.totalDelivered}      color="green"  />
              <MetricCard label="Con excepción"  value={report.totalException}      color="red"    />
              <MetricCard label="Total general"  value={report.totalGeneral}        total />
            </div>
          </div>

          {/* Detalle por estado */}
          {report.totalGeneral === 0 ? (
            <div className="card" style={{ marginTop: '1rem', textAlign: 'center', padding: '2rem', color: 'var(--color-text-tertiary)' }}>
              No hay envíos en el rango seleccionado.
            </div>
          ) : (
            <div className="card" style={{ marginTop: '1rem' }}>
              <div className="card-header">
                <h3>Detalle por estado</h3>
              </div>
              {Object.entries(STATUS_CONFIG).map(([key, config]) =>
                report[key]?.length > 0 && (
                  <ShipmentTable
                    key={key}
                    title={config.label}
                    badgeClass={config.className}
                    shipments={report[key]}
                  />
                )
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function MetricCard({ label, value, color, total }) {
  const colorMap = {
    blue:   'var(--color-text-info)',
    amber:  '#854F0B',
    purple: '#534AB7',
    green:  'var(--color-text-success)',
    red:    'var(--color-text-danger)',
  };
  return (
    <div className={`metric-card${total ? ' metric-card--total' : ''}`}>
      <div className="metric-card__label">{label}</div>
      <div className="metric-card__value" style={{ color: color ? colorMap[color] : undefined }}>
        {value}
      </div>
    </div>
  );
}

function ShipmentTable({ title, badgeClass, shipments }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div className="section-title">
        <span className={`status-badge ${badgeClass}`}>{title}</span>
        <span className="count-pill">{shipments.length} envíos</span>
      </div>
      <table className="detail-table">
        <thead>
          <tr>
            <th>Número de guía</th>
            <th>Remitente</th>
            <th>Destinatario</th>
            <th>Origen</th>
            <th>Destino</th>
            <th>Peso (kg)</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {shipments.map((s) => (
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
  );
}
