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

export default function LogisticsReportPage() {
  const today   = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [from, setFrom]       = useState(weekAgo);
  const [to, setTo]           = useState(today);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [report, setReport]   = useState(null);  // ← objeto completo

  const handleSearch = async (e) => {
    e && e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const normalizedFrom = normalizeReportDate(from);
      const normalizedTo   = normalizeReportDate(to);
      const res  = await getShipmentsReport({ from: normalizedFrom, to: normalizedTo });
      const data = res.data?.content ?? res.data;
      setReport(data);   // ← guarda el objeto completo
    } catch (err) {
      setError(err.response?.data?.message || 'Error al obtener el reporte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Reporte de envíos por rango de fechas</h2>

      <form className="report-form" onSubmit={handleSearch}>
        <label>
          Desde
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} required />
        </label>
        <label>
          Hasta
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} required />
        </label>
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Cargando…' : 'Consultar'}
        </button>
      </form>

      {error && <div className="alert alert-error">{error}</div>}

      {report && (
        <section className="report-results">

          {/* ─── Resumen de conteos ─────────────────────────────── */}
          <div className="report-summary">
            <h3>Resumen del {report.from} al {report.to}</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Estado</th>
                  <th>Cantidad</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Creados</td>          <td>{report.totalCreated}</td></tr>
                <tr><td>En tránsito</td>       <td>{report.totalInTransit}</td></tr>
                <tr><td>En reparto</td>        <td>{report.totalOutForDelivery}</td></tr>
                <tr><td>Entregados</td>        <td>{report.totalDelivered}</td></tr>
                <tr><td>Con excepción</td>     <td>{report.totalException}</td></tr>
                <tr style={{fontWeight: 'bold'}}><td>Total general</td><td>{report.totalGeneral}</td></tr>
              </tbody>
            </table>
          </div>

          {/* ─── Detalle por estado ──────────────────────────────── */}
          {renderShipmentTable('Creados', report.created)}
          {renderShipmentTable('En tránsito', report.inTransit)}
          {renderShipmentTable('En reparto', report.outForDelivery)}
          {renderShipmentTable('Entregados', report.delivered)}
          {renderShipmentTable('Con excepción', report.exception)}

        </section>
      )}

      {report && report.totalGeneral === 0 && (
        <p>No hay resultados para el rango seleccionado.</p>
      )}
    </div>
  );
}

function renderShipmentTable(title, shipments) {
  if (!shipments || shipments.length === 0) return null;
  return (
    <div style={{ marginTop: '1.5rem' }}>
      <h4>{title} ({shipments.length})</h4>
      <table className="table">
        <thead>
          <tr>
            <th>Número de guía</th>
            <th>Remitente</th>
            <th>Destinatario</th>
            <th>Ciudad origen</th>
            <th>Ciudad destino</th>
            <th>Peso (kg)</th>
            <th>Fecha creación</th>
          </tr>
        </thead>
        <tbody>
          {shipments.map((s) => (
            <tr key={s.id}>
              <td>{s.trackingId}</td>
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
