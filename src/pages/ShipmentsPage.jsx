import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createShipment, getShipmentByTracking, searchShipments } from '../api/shipmentApi';

export default function ShipmentsPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    senderName: '', senderAddress: '', senderCity: '',
    recipientName: '', recipientAddress: '', recipientCity: '',
    weightKg: '',
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState('');


  const [filterSender, setFilterSender] = useState('');
const [filterRecipient, setFilterRecipient] = useState('');
const [listResults, setListResults] = useState([]);
const [listError, setListError] = useState('');
const [listLoading, setListLoading] = useState(false);
const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const pageSize = 10;

const handleFilterSearch = async (e, newPage = 1) => {
  if (e) e.preventDefault();
  setListError('');
  setListResults([]);

  const hasSender = filterSender.trim().length > 0;
  const hasRecipient = filterRecipient.trim().length > 0;

  if (hasSender && hasRecipient) {
    setListError('Ingrese solo un parámetro a la vez');
    return;
  }
  if (!hasSender && !hasRecipient) {
    setListError('Ingrese solo un parámetro a la vez');
    return;
  }

  setListLoading(true);
  try {
    const res = await searchShipments({
      senderName: hasSender ? filterSender.trim() : undefined,
      recipientName: hasRecipient ? filterRecipient.trim() : undefined,
      page: newPage,
      pageSize,
    });
    const data = res.data;
    // soporta tanto { items, total } como un array plano
    const items = Array.isArray(data) ? data : (data.items || data.results || []);
    const total = Array.isArray(data) ? items.length : (data.total ?? items.length);
    setListResults(items);
    setTotalPages(Math.max(1, Math.ceil(total / pageSize)));
    setPage(newPage);
  } catch (err) {
    setListError(err.response?.data?.error || 'Error en la búsqueda');
  } finally {
    setListLoading(false);
  }
};


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const payload = { ...form, weightKg: parseFloat(form.weightKg) };
      const res = await createShipment(payload);
      setResult(res.data);
    } catch (err) {
      const d = err.response?.data;
      setError(d?.error || d?.message || d?.details?.join(', ') || 'Error al crear envio');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchError('');
    setSearchResult(null);
    try {
      const res = await getShipmentByTracking(searchId);
      setSearchResult(res.data);
    } catch (err) {
      setSearchError(err.response?.status === 404 ? 'Envío no encontrado' : 'Error en la búsqueda');
    }
  };

  

  return (
    <div className="page">
      <div className="page-header">
        <p className="page-header__eyebrow">Envíos</p>
        <h1>Gestión de envíos</h1>
        <p>Cree envíos con datos completos del remitente y destinatario, o consulte por tracking ID.</p>
      </div>

      <div className="two-columns">
        <div className="card">
          <div className="card-header"><h3>Nuevo envío</h3></div>
          <div className="card-body">
            <form onSubmit={handleCreate}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre remitente</label>
                  <input name="senderName" value={form.senderName} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Nombre destinatario</label>
                  <input name="recipientName" value={form.recipientName} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Dirección remitente</label>
                  <input name="senderAddress" value={form.senderAddress} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Ciudad remitente</label>
                  <input name="senderCity" value={form.senderCity} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Dirección destinatario</label>
                  <input name="recipientAddress" value={form.recipientAddress} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Ciudad destinatario</label>
                  <input name="recipientCity" value={form.recipientCity} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label>Peso (kg)</label>
                <input name="weightKg" type="number" step="0.1" min="0.1" value={form.weightKg} onChange={handleChange} required />
              </div>
              {error && <div className="alert alert-error">{error}</div>}
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Creando…' : 'Crear envío'}
              </button>
            </form>

            {result && (
              <div className="alert alert-success">
                <strong>Envío creado</strong>
                <p>Tracking ID: <code className="tracking-id">{result.trackingId}</code></p>
                <p>Estado: {result.status}</p>
                <p>ID interno: <small className="code-chip">{result.id}</small></p>
                <div className="shipment-actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => navigate(`/tracking?id=${encodeURIComponent(result.id)}`)}
                  >
                    Ver tracking (UUID)
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate(`/tracking?id=${encodeURIComponent(result.trackingId)}`)}
                  >
                    Ver tracking (PQ-)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Buscar envío</h3></div>
          <div className="card-body">
            <form onSubmit={handleSearch}>
              <div className="form-group">
                <label htmlFor="search-tracking">Tracking ID</label>
                <input
                  id="search-tracking"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  placeholder="PQ-20260414-XXXXXX"
                  required
                />
              </div>
              <button type="submit" className="btn btn-secondary btn-full">Buscar</button>
            </form>

            {searchError && <div className="alert alert-error">{searchError}</div>}

            {searchResult && (
              <div className="shipment-detail">
                <h4>Detalle del envío</h4>
                <table className="detail-table">
                  <tbody>
                    <tr><td>Tracking ID</td><td><code className="code-chip">{searchResult.trackingId}</code></td></tr>
                    <tr><td>Estado</td><td><span className={`status status-${searchResult.status?.toLowerCase()}`}>{searchResult.status}</span></td></tr>
                    <tr><td>Remitente</td><td>{searchResult.senderName}</td></tr>
                    <tr><td>Destinatario</td><td>{searchResult.recipientName}</td></tr>
                    <tr><td>Peso</td><td>{searchResult.weightKg} kg</td></tr>
                    <tr><td>Creado</td><td>{searchResult.createdAt}</td></tr>
                  </tbody>
                </table>
                <div className="shipment-actions">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate(`/tracking?id=${encodeURIComponent(searchResult.id)}`)}
                  >
                    Abrir en tracking
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="card" style={{ marginTop: '1.5rem' }}>
      <div className="card-header"><h3>Buscar por remitente o destinatario</h3></div>
      <div className="card-body">
        <form onSubmit={(e) => handleFilterSearch(e, 1)}>
          <div className="form-row">
            <div className="form-group">
              <label>Remitente (búsqueda parcial)</label>
              <input
                value={filterSender}
                onChange={(e) => setFilterSender(e.target.value)}
                placeholder="Ej: Juan"
              />
            </div>
            <div className="form-group">
              <label>Destinatario (búsqueda parcial)</label>
              <input
                value={filterRecipient}
                onChange={(e) => setFilterRecipient(e.target.value)}
                placeholder="Ej: María"
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={listLoading}>
            {listLoading ? 'Buscando…' : 'Buscar'}
          </button>
        </form>

        {listError && <div className="alert alert-error" style={{ marginTop: '1rem' }}>{listError}</div>}

        {listResults.length > 0 && (
          <>
            <table className="detail-table" style={{ marginTop: '1rem' }}>
              <thead>
                <tr>
                  <th>Tracking ID</th>
                  <th>Remitente</th>
                  <th>Destinatario</th>
                  <th>Estado</th>
                  <th>Peso</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {listResults.map((s) => (
                  <tr key={s.id}>
                    <td><code className="code-chip">{s.trackingId}</code></td>
                    <td>{s.senderName}</td>
                    <td>{s.recipientName}</td>
                    <td><span className={`status status-${s.status?.toLowerCase()}`}>{s.status}</span></td>
                    <td>{s.weightKg} kg</td>
                    
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="shipment-actions" style={{ justifyContent: 'space-between', marginTop: '1rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={page <= 1 || listLoading}
                onClick={() => handleFilterSearch(null, page - 1)}
              >
                ← Anterior
              </button>
              <span>Página {page} de {totalPages}</span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={page >= totalPages || listLoading}
                onClick={() => handleFilterSearch(null, page + 1)}
              >
                Siguiente →
              </button>
            </div>
          </>
        )}

        {!listLoading && !listError && listResults.length === 0 && (filterSender || filterRecipient) && (
          <p style={{ marginTop: '1rem', color: 'var(--muted-foreground, #888)' }}>Sin resultados.</p>
        )}
      </div>
    </div>
    </div>
  );
}
