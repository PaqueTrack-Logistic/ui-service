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
  { key: 'created',        label: 'Creados',      color: '#185FA5', bg: '#E6F1FB' },
  { key: 'inTransit',      label: 'En tránsito',  color: '#854F0B', bg: '#FAEEDA' },
  { key: 'outForDelivery', label: 'En reparto',    color: '#534AB7', bg: '#EEEDFE' },
  { key: 'delivered',      label: 'Entregados',    color: '#3B6D11', bg: '#EAF3DE' },
  { key: 'exception',      label: 'Con excepción', color: '#A32D2D', bg: '#FCEBEB' },
];

const METRIC_CONFIG = [
  { key: 'totalCreated',        label: 'Creados',      color: '#185FA5', dot: '#378ADD' },
  { key: 'totalInTransit',      label: 'En tránsito',  color: '#854F0B', dot: '#EF9F27' },
  { key: 'totalOutForDelivery', label: 'En reparto',    color: '#534AB7', dot: '#7F77DD' },
  { key: 'totalDelivered',      label: 'Entregados',    color: '#3B6D11', dot: '#639922' },
  { key: 'totalException',      label: 'Con excepción', color: '#A32D2D', dot: '#E24B4A' },
];

const s = {
  page: { padding: '1.5rem 0', fontFamily: 'system-ui, sans-serif', fontSize: 15 },
  eyebrow: { fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: '#888', marginBottom: 4 },
  h1: { fontSize: 22, fontWeight: 500, margin: '4px 0 4px' },
  subtitle: { fontSize: 14, color: '#666', marginBottom: '1.5rem' },
  card: { background: '#fff', border: '0.5px solid #e0e0e0', borderRadius: 12, padding: '1.25rem', marginTop: '1rem' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: 8, paddingBottom: '.875rem', marginBottom: '1rem', borderBottom: '0.5px solid #e0e0e0' },
  cardTitle: { fontSize: 15, fontWeight: 500, margin: 0 },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'end' },
  fg: { display: 'flex', flexDirection: 'column', gap: 5 },
  fgLabel: { fontSize: 12, color: '#666', marginBottom: 2 },
  input: { height: 36, border: '0.5px solid #ccc', borderRadius: 8, padding: '0 10px', fontSize: 14, width: '100%' },
  btn: { height: 36, padding: '0 1.25rem', border: '0.5px solid #ccc', borderRadius: 8, cursor: 'pointer', fontSize: 14, background: '#fff', whiteSpace: 'nowrap' },
  metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: '1rem' },
  metricCard: { background: '#f7f7f5', borderRadius: 8, padding: '.875rem 1rem' },
  metricDot: { width: 8, height: 8, borderRadius: '50%', marginBottom: 6 },
  metricLabel: { fontSize: 11, color: '#888', marginBottom: 4 },
  metricVal: { fontSize: 24, fontWeight: 500, lineHeight: 1 },
  totalBar: { background: '#f7f7f5', borderRadius: 8, padding: '.875rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  totalLabel: { fontSize: 13, color: '#666' },
  totalVal: { fontSize: 28, fontWeight: 500 },
  progWrap: { marginTop: '1rem' },
  progTrack: { height: 6, background: '#eee', borderRadius: 999, overflow: 'hidden', display: 'flex', gap: 2 },
  progSeg: { height: '100%', borderRadius: 999 },
  legend: { display: 'flex', gap: 12, marginTop: 6, flexWrap: 'wrap' },
  legendItem: { fontSize: 11, color: '#888', display: 'flex', alignItems: 'center', gap: 4 },
  legendDot: { width: 7, height: 7, borderRadius: '50%', display: 'inline-block' },
  sectionWrap: { marginTop: '1.25rem' },
  sectionHd: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: '.75rem' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 999 },
  pill: { fontSize: 11, padding: '2px 8px', borderRadius: 999, background: '#f0f0ee', color: '#888' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { fontSize: 11, fontWeight: 500, color: '#888', textAlign: 'left', padding: '7px 10px', borderBottom: '0.5px solid #e0e0e0', whiteSpace: 'nowrap' },
  td: { padding: '8px 10px', borderBottom: '0.5px solid #e0e0e0', fontSize: 13 },
  chip: { fontFamily: 'monospace', fontSize: 11, background: '#f0f0ee', padding: '2px 7px', borderRadius: 6, color: '#555' },
  alertErr: { background: '#FCEBEB', color: '#A32D2D', borderRadius: 8, padding: '.625rem 1rem', fontSize: 13, marginTop: '.875rem' },
  empty: { textAlign: 'center', padding: '2rem', color: '#aaa', fontSize: 13 },
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
    <div style={s.page}>
      <p style={s.eyebrow}>Reportes</p>
      <h1 style={s.h1}>Reporte de envíos</h1>
      <p style={s.subtitle}>Volumen operativo por estado en un rango de fechas seleccionado.</p>

      {/* ─── Formulario ─────────────────────────────────────── */}
      <div style={{ ...s.card, marginTop: 0 }}>
        <div style={s.cardHeader}>
          <h3 style={s.cardTitle}>Seleccionar período</h3>
        </div>
        <form onSubmit={handleSearch}>
          <div style={s.formRow}>
            <div style={s.fg}>
              <label style={s.fgLabel}>Fecha inicio</label>
              <input style={s.input} type="date" value={from}
                onChange={(e) => setFrom(e.target.value)} required />
            </div>
            <div style={s.fg}>
              <label style={s.fgLabel}>Fecha fin</label>
              <input style={s.input} type="date" value={to}
                onChange={(e) => setTo(e.target.value)} required />
            </div>
            <button style={s.btn} type="submit" disabled={loading}>
              {loading ? 'Cargando…' : 'Consultar'}
            </button>
          </div>
        </form>
        {error && <div style={s.alertErr}>{error}</div>}
      </div>

      {/* ─── Resumen ─────────────────────────────────────────── */}
      {report && (
        <>
          <div style={s.card}>
            <div style={s.cardHeader}>
              <h3 style={s.cardTitle}>Resumen — {report.from} al {report.to}</h3>
            </div>

            <div style={s.metricsGrid}>
              {METRIC_CONFIG.map(({ key, label, color, dot }) => (
                <div key={key} style={s.metricCard}>
                  <div style={{ ...s.metricDot, background: dot }} />
                  <div style={s.metricLabel}>{label}</div>
                  <div style={{ ...s.metricVal, color }}>{report[key]}</div>
                </div>
              ))}
            </div>

            <div style={s.totalBar}>
              <span style={s.totalLabel}>Total de envíos en el período</span>
              <span style={s.totalVal}>{report.totalGeneral}</span>
            </div>

            {report.totalGeneral > 0 && (
              <div style={s.progWrap}>
                <div style={s.progTrack}>
                  {METRIC_CONFIG.map(({ key, dot }) => {
                    const pct = ((report[key] / report.totalGeneral) * 100).toFixed(1);
                    return parseFloat(pct) > 0
                      ? <div key={key} style={{ ...s.progSeg, width: `${pct}%`, background: dot }} />
                      : null;
                  })}
                </div>
                <div style={s.legend}>
                  {METRIC_CONFIG.map(({ key, label, dot }) => (
                    <span key={key} style={s.legendItem}>
                      <span style={{ ...s.legendDot, background: dot }} />
                      {label} {((report[key] / report.totalGeneral) * 100).toFixed(0)}%
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ─── Detalle ─────────────────────────────────────── */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <h3 style={s.cardTitle}>Detalle por estado</h3>
            </div>

            {report.totalGeneral === 0 ? (
              <p style={s.empty}>No hay envíos en el rango seleccionado.</p>
            ) : (
              STATUS_SECTIONS.map(({ key, label, color, bg }) =>
                report[key]?.length > 0 && (
                  <div key={key} style={s.sectionWrap}>
                    <div style={s.sectionHd}>
                      <span style={{ ...s.badge, background: bg, color }}>{label}</span>
                      <span style={s.pill}>{report[key].length} envíos</span>
                    </div>
                    <table style={s.table}>
                      <thead>
                        <tr>
                          {['Guía', 'Remitente', 'Destinatario', 'Origen', 'Destino', 'Peso kg', 'Fecha'].map(h => (
                            <th key={h} style={s.th}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {report[key].map((shipment) => (
                          <tr key={shipment.id}>
                            <td style={s.td}><span style={s.chip}>{shipment.trackingId}</span></td>
                            <td style={s.td}>{shipment.senderName}</td>
                            <td style={s.td}>{shipment.recipientName}</td>
                            <td style={s.td}>{shipment.senderCity}</td>
                            <td style={s.td}>{shipment.recipientCity}</td>
                            <td style={s.td}>{shipment.weightKg}</td>
                            <td style={s.td}>{shipment.createdAt ? shipment.createdAt.slice(0, 10) : '-'}</td>
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
