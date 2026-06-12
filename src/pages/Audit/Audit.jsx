import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Search, Truck, User, Package, ChevronRight, ChevronLeft,
  RefreshCw, Box, Calendar, CreditCard, Hash, CheckCircle2,
  Clock, AlertCircle, X, ScanBarcode, Filter
} from 'lucide-react';
import { api } from '../../services/api';

const STATUS_CONFIG = {
  'Active':    { label: 'Activo',      bg: 'var(--color-primary-bg)',    color: 'var(--color-primary)' },
  'Completed': { label: 'Completado',  bg: 'var(--color-success-bg)',    color: 'var(--color-success)' },
  'Pending':   { label: 'Pendiente',   bg: 'var(--color-warning-bg)',    color: 'var(--color-warning)' },
  'Cancelled': { label: 'Cancelado',   bg: 'var(--color-danger-bg)',     color: 'var(--color-danger)'  },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, bg: 'var(--bg-surface)', color: 'var(--text-muted)' };
  return (
    <span style={{
      padding: '0.3rem 0.875rem',
      borderRadius: 'var(--radius-full)',
      fontSize: '0.8rem', fontWeight: 600,
      background: cfg.bg, color: cfg.color
    }}>
      {cfg.label}
    </span>
  );
};

const Audit = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('shipmentNumber'); // shipmentNumber | vehiclePlate | barcode
  const [statusFilter, setStatusFilter] = useState('');
  const [searching, setSearching] = useState(false);

  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  // Carga inicial — todos los envíos
  const loadAll = async (status = '') => {
    try {
      setLoading(true);
      const url = status ? `/Shipment?status=${status}` : '/Shipment';
      const data = await api.get(url, { headers: headers() });
      setShipments(data);
    } catch (err) {
      toast.error('Error al cargar envíos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(statusFilter); }, [statusFilter]);

  // Búsqueda
  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return loadAll(statusFilter);

    try {
      setSearching(true);
      let data;

      if (searchType === 'barcode') {
        // Busca por serial → devuelve un objeto, no array
        const result = await api.get(
          `/Shipment/search?barcode=${encodeURIComponent(searchQuery.trim())}`,
          { headers: headers() }
        );
        // Normalizar a array para reutilizar el mismo render
        data = result ? [result] : [];
      } else {
        const param = searchType === 'shipmentNumber'
          ? `shipmentNumber=${encodeURIComponent(searchQuery.trim())}`
          : `vehiclePlate=${encodeURIComponent(searchQuery.trim())}`;
        data = await api.get(`/Shipment/search-shipments?${param}`, { headers: headers() });
      }

      setShipments(data);
    } catch (err) {
      if (err.message?.includes('404') || err.message?.toLowerCase().includes('no encontrado')) {
        setShipments([]);
      } else {
        toast.error('Error en la búsqueda: ' + err.message);
      }
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    loadAll(statusFilter);
  };

  // Detalle de un envío
  const openDetail = async (shipment) => {
    try {
      setLoadingDetail(true);
      const data = await api.get(`/Shipment/${shipment.id}`, { headers: headers() });
      setSelectedShipment(data);
    } catch (err) {
      toast.error('Error al cargar detalle: ' + err.message);
    } finally {
      setLoadingDetail(false);
    }
  };

  // ─── DETALLE ────────────────────────────────────────────────────────────
  if (selectedShipment) {
    const totalExpected = selectedShipment.products?.reduce((s, p) => s + (p.expectedUnits || 0), 0) || 0;
    const totalScanned  = selectedShipment.products?.reduce((s, p) => s + (p.scannedCount  || 0), 0) || 0;
    const pct = totalExpected > 0 ? Math.round((totalScanned / totalExpected) * 100) : 0;

    return (
      <div className="animate-slide-up" style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '3rem' }}>

        {/* Back */}
        <button
          onClick={() => setSelectedShipment(null)}
          className="btn btn-glass"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1.1rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}
        >
          <ChevronLeft size={16} /> Volver a auditoría
        </button>

        {/* Header del envío */}
        <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, var(--color-primary-bg), var(--bg-surface))' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                Número de envío
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {selectedShipment.shipmentNumber}
              </div>
            </div>
            <StatusBadge status={selectedShipment.status} />
          </div>

          {/* Info grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
            {[
              { icon: <User size={15} />, label: 'Conductor', value: selectedShipment.driverName },
              { icon: <CreditCard size={15} />, label: 'Placa', value: selectedShipment.vehiclePlate },
              { icon: <Truck size={15} />, label: 'Transportadora', value: selectedShipment.carrier },
              { icon: <Calendar size={15} />, label: 'Fecha creación', value: selectedShipment.createdAt ? new Date(selectedShipment.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' },
              { icon: <Hash size={15} />, label: 'Creado por', value: selectedShipment.createdByName || '—' },
              { icon: <CheckCircle2 size={15} />, label: 'Completado por', value: selectedShipment.completedByName || '—' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', padding: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '4px' }}>
                  {item.icon} {item.label}
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{item.value || '—'}</div>
              </div>
            ))}
          </div>

          {/* Progreso */}
          <div style={{ marginTop: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              <span>Unidades escaneadas</span>
              <span style={{ fontWeight: 600 }}>{totalScanned} / {totalExpected} ({pct}%)</span>
            </div>
            <div style={{ background: 'var(--bg-app)', borderRadius: 'var(--radius-full)', height: '8px', overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, background: pct === 100 ? 'var(--color-success)' : 'var(--color-primary)', height: '100%', borderRadius: 'var(--radius-full)', transition: 'width 0.3s' }} />
            </div>
          </div>
        </div>

        {/* Productos */}
        <div className="glass-panel" style={{ overflow: 'hidden', marginBottom: '1.5rem' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Package size={16} /> Productos del envío
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', background: 'var(--bg-surface)', padding: '3px 10px', borderRadius: 'var(--radius-full)' }}>
              {selectedShipment.products?.length || 0} productos
            </span>
          </div>
          {(selectedShipment.products || []).map((product, i) => {
            const done = product.expectedUnits > 0 && product.scannedCount >= product.expectedUnits;
            const prodPct = product.expectedUnits > 0 ? Math.round((product.scannedCount / product.expectedUnits) * 100) : 0;
            return (
              <div key={i} style={{ padding: '1.25rem 1.5rem', borderBottom: i < selectedShipment.products.length - 1 ? '1px solid var(--border-glass)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1rem' }}>{product.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{product.model}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: done ? 'var(--color-success)' : 'var(--color-primary)' }}>
                      {product.scannedCount} / {product.expectedUnits}
                    </span>
                    {done && (
                      <span style={{ fontSize: '0.75rem', background: 'var(--color-success-bg)', color: 'var(--color-success)', padding: '2px 10px', borderRadius: 'var(--radius-full)' }}>
                        Completo
                      </span>
                    )}
                  </div>
                </div>

                {/* Barra de progreso del producto */}
                <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-full)', height: '5px', overflow: 'hidden', marginBottom: product.barcodes?.length ? '0.875rem' : 0 }}>
                  <div style={{ width: `${prodPct}%`, background: done ? 'var(--color-success)' : 'var(--color-primary)', height: '100%', borderRadius: 'var(--radius-full)' }} />
                </div>

                {/* Seriales escaneados */}
                {product.barcodes?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {product.barcodes.map((bc, j) => (
                      <span key={j} style={{
                        fontFamily: 'monospace', fontSize: '0.8rem',
                        background: 'var(--bg-surface)', color: 'var(--text-secondary)',
                        border: '1px solid var(--border-glass)',
                        padding: '3px 10px', borderRadius: 'var(--radius-md)'
                      }}>
                        {bc}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── LISTA ───────────────────────────────────────────────────────────────
  return (
    <div className="animate-slide-up" style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '3rem' }}>

      <header style={{ marginBottom: '2rem' }}>
        <h1 className="text-primary" style={{ fontSize: '2.5rem', letterSpacing: '-0.04em', fontWeight: 700 }}>Auditoría</h1>
        <p className="text-secondary" style={{ fontSize: '1.05rem' }}>Rastrea el ciclo de vida de cualquier envío, vehículo o serial.</p>
      </header>

      {/* Buscador */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 3, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder={
                searchType === 'barcode'        ? 'Buscar por serial / código de barras...' :
                searchType === 'vehiclePlate'   ? 'Buscar por placa del vehículo...' :
                                                  'Buscar por número de envío...'
              }
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '3rem', fontSize: '1rem', background: 'var(--bg-app)' }}
            />
            {searchQuery && (
              <button type="button" onClick={clearSearch} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                <X size={16} />
              </button>
            )}
          </div>

          <select
            value={searchType}
            onChange={e => setSearchType(e.target.value)}
            style={{
              padding: '0 1rem', borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-surface)', color: 'var(--text-primary)',
              border: '1px solid var(--border-glass)', outline: 'none', fontSize: '0.95rem'
            }}
          >
            <option value="shipmentNumber">Nº Envío</option>
            <option value="vehiclePlate">Placa</option>
            <option value="barcode">Serial / Barcode</option>
          </select>

          <button type="submit" className="btn btn-primary" style={{ padding: '0 1.5rem' }} disabled={searching}>
            {searching ? <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={18} />}
            Buscar
          </button>
        </form>
      </div>

      {/* Filtros de estado */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { value: '', label: 'Todos' },
          { value: 'Active', label: 'Activos' },
          { value: 'Completed', label: 'Completados' },
          { value: 'Pending', label: 'Pendientes' },
        ].map(opt => (
          <button
            key={opt.value}
            onClick={() => { setStatusFilter(opt.value); setSearchQuery(''); }}
            style={{
              padding: '0.45rem 1.1rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.875rem', fontWeight: 500,
              border: statusFilter === opt.value ? '2px solid var(--color-primary)' : '1px solid var(--border-glass)',
              background: statusFilter === opt.value ? 'var(--color-primary-bg)' : 'var(--bg-surface)',
              color: statusFilter === opt.value ? 'var(--color-primary)' : 'var(--text-secondary)',
              cursor: 'pointer', transition: 'all 0.15s'
            }}
          >
            {opt.label}
          </button>
        ))}
        <button
          onClick={() => loadAll(statusFilter)}
          className="btn btn-glass"
          style={{ padding: '0.45rem 0.875rem', marginLeft: 'auto' }}
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
          <div className="spinner" style={{ width: '36px', height: '36px', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--text-muted)' }}>Cargando envíos...</p>
        </div>
      ) : shipments.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
          <Package size={44} style={{ opacity: 0.2, margin: '0 auto 1rem', display: 'block' }} />
          <p style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Sin resultados</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Intenta con otro término o limpia los filtros</p>
        </div>
      ) : (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'var(--bg-surface-active)' }}>
              <tr>
                {['Envío', 'Conductor / Vehículo', 'Transportadora', 'Progreso', 'Estado', ''].map((h, i) => (
                  <th key={i} style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shipments.map((s, i) => {
                const scanned  = s.products?.reduce((acc, p) => acc + (p.scannedCount  || 0), 0) ?? s.scannedCount  ?? 0;
                const expected = s.products?.reduce((acc, p) => acc + (p.expectedUnits || 0), 0) ?? s.expectedUnits ?? 0;
                const pct = expected > 0 ? Math.round((scanned / expected) * 100) : 0;

                return (
                  <tr
                    key={s.id ?? i}
                    style={{ borderBottom: '1px solid var(--border-glass)', transition: 'background 0.15s', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    onClick={() => openDetail(s)}
                  >
                    {/* Envío */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                        <div style={{ padding: '0.5rem', background: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)', color: 'var(--color-primary)', flexShrink: 0 }}>
                          <Box size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.975rem' }}>{s.shipmentNumber}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {s.createdAt ? new Date(s.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Conductor */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{s.driverName || '—'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <CreditCard size={11} /> {s.vehiclePlate || '—'}
                      </div>
                    </td>

                    {/* Transportadora */}
                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Truck size={13} /> {s.carrier || '—'}
                      </div>
                    </td>

                    {/* Progreso */}
                    <td style={{ padding: '1rem 1.25rem', minWidth: '140px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '5px' }}>
                        <span>{scanned} / {expected} uds</span>
                        <span>{pct}%</span>
                      </div>
                      <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-full)', height: '5px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, background: pct === 100 ? 'var(--color-success)' : 'var(--color-primary)', height: '100%', borderRadius: 'var(--radius-full)' }} />
                      </div>
                    </td>

                    {/* Estado */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <StatusBadge status={s.status} />
                    </td>

                    {/* Acción */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        {loadingDetail
                          ? <RefreshCw size={15} style={{ color: 'var(--text-muted)', animation: 'spin 1s linear infinite' }} />
                          : <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
                        }
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Audit;