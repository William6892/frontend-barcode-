import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  ScanBarcode, AlertCircle, CheckCircle2, Search, Truck, 
  Package, User, CreditCard, Calendar, MapPin,
  ChevronRight, ChevronLeft, RefreshCw,
  ClipboardList, Check, CircleCheck
} from 'lucide-react';
import { api } from '../../services/api';

const Scanner = () => {
  const [barcode, setBarcode] = useState('');
  const [scannedItems, setScannedItems] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [expectedProducts, setExpectedProducts] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [filteredShipments, setFilteredShipments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [loading, setLoading] = useState(false);
  const [loadingShipments, setLoadingShipments] = useState(true);
  const [showShipmentSelector, setShowShipmentSelector] = useState(true);
  const [recentScans, setRecentScans] = useState([]);
  const inputRef = useRef(null);

  // ─── Cargar envíos activos ────────────────────────────────────────────────
  useEffect(() => {
    loadShipments();
  }, []);

  const loadShipments = async () => {
    try {
      setLoadingShipments(true);
      const token = localStorage.getItem('token');
      const response = await api.get('/Shipment?status=Active', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShipments(response);
      setFilteredShipments(response);
    } catch (error) {
      toast.error('Error al cargar envíos: ' + error.message);
    } finally {
      setLoadingShipments(false);
    }
  };

  // ─── Filtro de búsqueda ──────────────────────────────────────────────────
  useEffect(() => {
    let filtered = [...shipments];
    if (searchTerm) {
      filtered = filtered.filter(shipment => {
        const term = searchTerm.toLowerCase();
        switch (searchType) {
          case 'number': return shipment.shipmentNumber?.toLowerCase().includes(term);
          case 'plate':  return shipment.vehiclePlate?.toLowerCase().includes(term);
          case 'driver': return shipment.driverName?.toLowerCase().includes(term);
          default:
            return (
              shipment.shipmentNumber?.toLowerCase().includes(term) ||
              shipment.vehiclePlate?.toLowerCase().includes(term) ||
              shipment.driverName?.toLowerCase().includes(term)
            );
        }
      });
    }
    setFilteredShipments(filtered);
  }, [searchTerm, shipments, searchType]);

  // ─── Cargar detalles del envío ──────────────────────────────────────────
  const loadShipmentDetails = async (shipment) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await api.get(`/Shipment/${shipment.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSelectedShipment(response);

      const products = response.products.map(p => ({
        id: p.expectedProductId,
        name: p.name,
        model: p.model,
        scannedCount: p.scannedCount || 0,
        barcodes: p.barcodes || []
      }));

      setExpectedProducts(products);
      setSelectedProductId('');
      setShowShipmentSelector(false);

      toast.success(`Envío ${response.shipmentNumber} seleccionado`);
    } catch (error) {
      toast.error('Error al cargar el envío: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── 🔥 NUEVO: Reconstruir historial cuando cambian los productos ───────
  useEffect(() => {
    if (expectedProducts.length === 0) return;

    const allScans = expectedProducts.flatMap(p =>
      (p.barcodes || []).map(bc => ({
        id: `${p.id}-${bc}`,
        barcode: bc,
        productName: p.name,
        scannedAt: new Date().toLocaleTimeString()
      }))
    );

    setScannedItems(allScans.reverse());
    setRecentScans(allScans.slice(0, 5));
  }, [expectedProducts]);

  // ─── Escanear producto ────────────────────────────────────────────────────
  const handleScan = async (e) => {
    e.preventDefault();
    if (!barcode.trim()) return toast.error('Ingresa un código de barras');
    if (!selectedShipment) {
      setShowShipmentSelector(true);
      return toast.error('Selecciona un envío primero');
    }
    if (!selectedProductId) return toast.error('Selecciona a qué equipo pertenece este escaneo');

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(`/Shipment/${selectedShipment.id}/scan`, {
        expectedProductId: parseInt(selectedProductId),
        barcode: barcode.trim()
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (response) {
        const product = expectedProducts.find(p => p.id == selectedProductId);
        const newItem = {
          id: Date.now(),
          barcode: barcode.trim(),
          productName: product.name,
          scannedAt: new Date().toLocaleTimeString()
        };

        setScannedItems(prev => [newItem, ...prev]);
        setRecentScans(prev => [newItem, ...prev].slice(0, 5));
        setExpectedProducts(prev => prev.map(p =>
          p.id == selectedProductId
            ? { ...p, scannedCount: (p.scannedCount || 0) + 1, barcodes: [...(p.barcodes || []), barcode.trim()] }
            : p
        ));

        new Audio('/beep.mp3').play().catch(() => {});
        toast.success(`${barcode.trim()} — ${product.name}`, { duration: 1500, position: 'top-center' });
        setBarcode('');
      }
    } catch (error) {
      toast.error(error.message || 'Error al registrar el escaneo', { duration: 4000 });
    } finally {
      setLoading(false);
    }
  };

  // ─── Auto-focus ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!showShipmentSelector && selectedShipment && selectedProductId) {
      inputRef.current?.focus();
      const interval = setInterval(() => inputRef.current?.focus(), 2000);
      return () => clearInterval(interval);
    }
  }, [showShipmentSelector, selectedShipment, selectedProductId]);

  // ─── Cálculos ─────────────────────────────────────────────────────────────
  const totalScanned = scannedItems.length;
  const totalExpected = expectedProducts.length;
  const progressPercent = totalExpected > 0 ? (totalScanned / totalExpected) * 100 : 0;

  // ─── SELECTOR DE ENVÍO ────────────────────────────────────────────────────
  if (showShipmentSelector) {
    return (
      <div className="scanner-container" style={{ minHeight: '100vh', background: 'var(--bg-gradient)', padding: '2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Escáner de despacho
            </h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.95rem' }}>
              Selecciona un envío activo para comenzar
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 2, position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                    fontSize: '0.95rem',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-glass)',
                    outline: 'none'
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <select
                  value={searchType}
                  onChange={e => setSearchType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-glass)',
                    outline: 'none',
                    fontSize: '0.95rem'
                  }}
                >
                  <option value="all">Todo</option>
                  <option value="number">Nº Envío</option>
                  <option value="plate">Placa</option>
                  <option value="driver">Conductor</option>
                </select>
              </div>
              <button onClick={loadShipments} className="btn btn-glass" style={{ padding: '0 1rem' }}>
                <RefreshCw size={18} />
              </button>
            </div>
          </div>

          {loadingShipments ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
              <div className="spinner" style={{ width: '36px', height: '36px', margin: '0 auto 1rem' }} />
              <p style={{ color: 'var(--text-muted)' }}>Cargando envíos activos...</p>
            </div>
          ) : filteredShipments.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
              <Package size={44} style={{ margin: '0 auto 1rem', opacity: 0.25, display: 'block' }} />
              <p style={{ fontSize: '1.1rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>No hay envíos activos</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Crea un nuevo envío para comenzar a escanear</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '0.875rem', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
              {filteredShipments.map(shipment => {
                const scannedCount = shipment.products?.reduce((sum, p) => sum + (p.scannedCount || 0), 0) || 0;
                const expectedCount = shipment.products?.length || 0;
                const percent = expectedCount > 0 ? (scannedCount / expectedCount) * 100 : 0;

                return (
                  <button
                    key={shipment.id}
                    onClick={() => loadShipmentDetails(shipment)}
                    className="glass-panel"
                    style={{
                      textAlign: 'left',
                      cursor: 'pointer',
                      border: '1px solid var(--border-glass)',
                      padding: '1.25rem',
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
                      <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                          {shipment.shipmentNumber}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {shipment.carrier}
                        </div>
                      </div>
                      <ChevronRight size={18} style={{ color: 'var(--text-muted)', marginTop: '2px' }} />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <User size={13} /> {shipment.driverName}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Truck size={13} /> {shipment.vehiclePlate}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      <span>Progreso</span>
                      <span>{scannedCount} / {expectedCount}</span>
                    </div>
                    <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-full)', height: '5px', overflow: 'hidden' }}>
                      <div style={{ width: `${percent}%`, background: 'var(--color-primary)', height: '100%', borderRadius: 'var(--radius-full)', transition: 'width 0.3s' }} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── ESCÁNER ──────────────────────────────────────────────────────────────
  return (
    <div className="scanner-container" style={{ minHeight: '100vh', background: 'var(--bg-gradient)', padding: '2rem' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>

        <button
          onClick={() => setShowShipmentSelector(true)}
          className="btn btn-glass"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1.1rem', marginBottom: '1.25rem', fontSize: '0.9rem' }}
        >
          <ChevronLeft size={16} /> Cambiar envío
        </button>

        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, var(--color-primary-bg), var(--bg-surface))' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                Envío activo
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {selectedShipment?.shipmentNumber}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Truck size={13} /> {selectedShipment?.carrier}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><User size={13} /> {selectedShipment?.driverName}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><CreditCard size={13} /> {selectedShipment?.vehiclePlate}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
            <span>Progreso del envío</span>
            <span style={{ fontWeight: 600 }}>{totalScanned} productos escaneados</span>
          </div>
          <div style={{ background: 'var(--bg-app)', borderRadius: 'var(--radius-full)', height: '8px', overflow: 'hidden' }}>
            <div style={{
              width: `${progressPercent}%`,
              background: 'var(--color-primary)',
              height: '100%',
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.3s'
            }} />
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.875rem' }}>
            Producto a escanear
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {expectedProducts.map(product => {
              const isSelected = selectedProductId == product.id;
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => setSelectedProductId(product.id)}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.875rem 1rem',
                    background: isSelected ? 'var(--color-primary-bg)' : 'var(--bg-surface)',
                    border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--border-glass)',
                    borderRadius: 'var(--radius-lg)',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.975rem', color: 'var(--text-primary)' }}>{product.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{product.model}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                      {product.scannedCount}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleScan}>
          <div className="glass-panel" style={{ padding: '2rem 1.5rem', textAlign: 'center', marginBottom: '1rem' }}>
            <div style={{
              width: '56px', height: '56px',
              background: 'var(--color-primary-bg)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}>
              <ScanBarcode size={28} style={{ color: 'var(--color-primary)' }} />
            </div>
            <div style={{ position: 'relative' }}>
              <input
                ref={inputRef}
                type="text"
                placeholder="Escanea el código de barras aquí..."
                value={barcode}
                onChange={e => setBarcode(e.target.value)}
                disabled={!selectedProductId || loading}
                autoFocus
                style={{
                  width: '100%',
                  padding: '1rem 3rem 1rem 1rem',
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  textAlign: 'center',
                  letterSpacing: '2px',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  background: 'var(--bg-app)',
                  color: 'var(--color-primary)',
                  outline: 'none'
                }}
              />
              <div style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '10px', height: '10px',
                background: loading ? 'orange' : (barcode ? 'var(--color-success)' : '#ef4444'),
                borderRadius: '50%'
              }} />
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
              {loading ? 'Procesando...' : 'El campo se mantiene enfocado para lectura continua'}
            </p>
          </div>
        </form>

        {recentScans.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {recentScans.map((scan, i) => (
              <span key={i} style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                background: 'var(--color-success-bg)',
                color: 'var(--color-success)',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.825rem'
              }}>
                <Check size={12} /> {scan.barcode}
              </span>
            ))}
          </div>
        )}

        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
              <ClipboardList size={16} /> Historial de escaneos
            </h3>
            <span style={{
              fontSize: '0.78rem', color: 'var(--text-muted)',
              background: 'var(--bg-surface)',
              padding: '3px 10px', borderRadius: 'var(--radius-full)'
            }}>
              {scannedItems.length} registros
            </span>
          </div>

          {scannedItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 0', color: 'var(--text-muted)' }}>
              <ScanBarcode size={40} style={{ opacity: 0.2, margin: '0 auto 0.75rem', display: 'block' }} />
              <p style={{ fontSize: '0.9rem' }}>Esperando el primer escaneo...</p>
            </div>
          ) : (
            <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Código</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Producto</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {scannedItems.map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                      <td style={{ padding: '0.7rem 0.75rem', fontFamily: 'monospace', fontWeight: 600, fontSize: '0.9rem' }}>{item.barcode}</td>
                      <td style={{ padding: '0.7rem 0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{item.productName}</td>
                      <td style={{ padding: '0.7rem 0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.scannedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ✅ Botón finalizar - aparece con cualquier escaneo */}
        {totalScanned > 0 && (
          <button
            className="btn btn-primary w-full"
            style={{
              padding: '0.9rem',
              background: 'linear-gradient(135deg, var(--color-success), #059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              fontSize: '0.95rem', fontWeight: 600
            }}
            onClick={async () => {
              try {
                const token = localStorage.getItem('token');
                await api.post(`/Shipment/${selectedShipment.id}/complete`, {}, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                toast.success(`✅ Envío finalizado con ${totalScanned} productos escaneados`);
                setShowShipmentSelector(true);
              } catch {
                toast.error('❌ Error al finalizar el envío');
              }
            }}
          >
            <CircleCheck size={18} /> Finalizar envío ({totalScanned} productos)
          </button>
        )}
      </div>
    </div>
  );
};

export default Scanner;