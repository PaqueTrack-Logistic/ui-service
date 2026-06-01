import { useState } from 'react';
import { getShipmentsReport } from '../api/shipmentApi';

const normalizeReportDate = (value) => {
  if (!value) return '';
  const isoPattern = /^\d{4}-\d{2}-\d{2}$/;
  if (isoPattern.test(value)) return value;
  const localPattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = value.match(localPattern);
  if (match) {
    return `${match[3]}-${match[2]}-${match[1]}`;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString().slice(0, 10);
};

export default function LogisticsReportPage() {
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const [from, setFrom] = useState(weekAgo);
  const [to, setTo] = useState(today);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);

  const handleSearch = async (e) => {
    e && e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const normalizedFrom = normalizeReportDate(from);
      const normalizedTo = normalizeReportDate(to);
      const res = await getShipmentsReport({ from: normalizedFrom, to: normalizedTo });
      const data = res.data?.content ?? res.data;
      // Expecting an array; store as-is for flexible rendering
      setItems(Array.isArray(data) ? data : []);
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
        <button type="submit" className="btn" disabled={loading}>{loading ? 'Cargando…' : 'Consultar'}</button>
      </form>

      {error && <div className="alert alert-error">{error}</div>}

      <section className="report-results">
        {items.length === 0 ? (
          <p>No hay resultados para el rango seleccionado.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Volumen / Conteo</th>
                <th>Datos</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={idx}>
                  <td>{it.date || it.fecha || it.from || '-'}</td>
                  <td>{it.count ?? it.volume ?? '-'}</td>
                  <td><pre style={{whiteSpace: 'pre-wrap', margin: 0}}>{JSON.stringify(it, null, 2)}</pre></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
