import { useState } from 'react';
import { createShipment, getShipmentByTracking } from '../api/shipmentApi';

export default function ShipmentsPage() {
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
      setSearchError(err.response?.status === 404 ? 'Envio no encontrado' : 'Error en la busqueda');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Gestion de Envios</h1>
        <p>Crear nuevos envios y consultar por tracking ID</p>
      </div>

      <div className="two-columns">
        <div className="card">
          <div className="card-header"><h3>Crear Envio</h3></div>
          <div className="card-body">
            <form onSubmit={handleCreate}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre Remitente</label>
                  <input name="senderName" value={form.senderName} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Nombre Destinatario</label>
                  <input name="recipientName" value={form.recipientName} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Direccion Remitente</label>
                  <input name="senderAddress" value={form.senderAddress} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Ciudad Remitente</label>
                  <input name="senderCity" value={form.senderCity} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Direccion Destinatario</label>
                  <input name="recipientAddress" value={form.recipientAddress} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Ciudad Destinatario</label>
                  <input name="recipientCity" value={form.recipientCity} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label>Peso (Kg)</label>
                <input name="weightKg" type="number" step="0.1" min="0.1" value={form.weightKg} onChange={handleChange} required />
              </div>
              {error && <div className="alert alert-error">{error}</div>}
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Creando...' : 'Crear Envio'}
              </button>
            </form>

            {result && (
              <div className="alert alert-success">
                <strong>Envio creado</strong>
                <p>Tracking ID: <code className="tracking-id">{result.trackingId}</code></p>
                <p>Estado: {result.status}</p>
                <p>ID: <small>{result.id}</small></p>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Buscar Envio</h3></div>
          <div className="card-body">
            <form onSubmit={handleSearch}>
              <div className="form-group">
                <label>Tracking ID</label>
                <input
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
                <h4>Detalle del Envio</h4>
                <table className="detail-table">
                  <tbody>
                    <tr><td>Tracking ID</td><td><code>{searchResult.trackingId}</code></td></tr>
                    <tr><td>Estado</td><td><span className={`status status-${searchResult.status?.toLowerCase()}`}>{searchResult.status}</span></td></tr>
                    <tr><td>Remitente</td><td>{searchResult.senderName}</td></tr>
                    <tr><td>Destinatario</td><td>{searchResult.recipientName}</td></tr>
                    <tr><td>Peso</td><td>{searchResult.weightKg} Kg</td></tr>
                    <tr><td>Creado</td><td>{searchResult.createdAt}</td></tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
