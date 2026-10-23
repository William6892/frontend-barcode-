import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import {
  ScanBarcode, Search, Truck, User, CreditCard, ChevronRight, ChevronLeft,
  RefreshCw, CircleCheck, CheckCircle2, XCircle, PackageOpen, History
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import './Scanner.css';

const PAGE_SIZE = 100;
const HISTORY_LIMIT = 200;

const fmt = (n) => (n ?? 0).toLocaleString('es-CO');

// Pitido corto: agudo si el escaneo entra, grave y largo si falla (el guarda no tiene que mirar la pantalla)
let audioCtx;
const beep = (ok) => {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.value = ok ? 1200 : 220;
    osc.type = ok ? 'sine' : 'square';
    gain.gain.value = 0.15;
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + (ok ? 0.12 : 0.5));
    if (!ok) navigator.vibrate?.([200, 100, 200]);
  } catch {
    // sin audio disponible
  }
};

const percentOf = (done, total) => (total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0);
const toneOf = (pct, total) => (total === 0 ? 'open' : pct >= 100 ? 'done' : pct >= 75 ? 'near' : 'active');

// Anillo de progreso por referencia
const Ring = ({ pct, tone, size = 54 }) => {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className={`ring ring--${tone}`} aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} className="ring-track" />
      <circle cx={size / 2} cy={size / 2} r={r} className="ring-fill"
        strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} />
    </svg>
  );
};

const SEARCH_TYPES = [
  { value: 'all', label: 'Todo' },
  { value: 'number', label: 'Nº envío' },
  { value: 'plate', label: 'Placa' },
  { value: 'driver', label: 'Conductor' },
];

const Scanner = () => {
  const [searchParams] = useSearchParams();
  const [barcode, setBarcode] = useState('');
  const [scannedItems, setScannedItems] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [expectedProducts, setExpectedProducts] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [loading, setLoading] = useState(false);
  const [loadingShipments, setLoadingShipments] = useState(true);
  const [showShipmentSelector, setShowShipmentSelector] = useState(true);
  const [lastResult, setLastResult] = useState(null);
  const [flash, setFlash] = useState(null);
  const inputRef = useRef(null);

  // ─── Cargar envíos activos ────────────────────────────────────────────────
  const loadShipments = async () => {
    try {
      setLoadingShipments(true);
      // El backend pagina de a 100: se piden páginas hasta traer todos los envíos activos
      const all = [];
      for (let page = 1; ; page++) {
        const batch = await api.get(`/Shipment?status=Active&page=${page}&pageSize=${PAGE_SIZE}`);
        all.push(...batch);
        if (batch.length < PAGE_SIZE) break;
      }
      setShipments(all);
    } catch (error) {
      toast.error('Error al cargar envíos: ' + error.message);
    } finally {
      setLoadingShipments(false);
    }
  };

  useEffect(() => {
    loadShipments();
  }, []);

  // ─── Filtro de búsqueda ──────────────────────────────────────────────────
  const term = searchTerm.trim().toLowerCase();
  const filteredShipments = !term ? shipments : shipments.filter(s => {
    const fields = {
      number: [s.shipmentNumber],
      plate: [s.vehiclePlate],
      driver: [s.driverName],
      all: [s.shipmentNumber, s.vehiclePlate, s.driverName, s.carrier],
    }[searchType];
    return fields.some(f => f?.toLowerCase().includes(term));
  });

  // ─── Cargar detalles del envío ──────────────────────────────────────────
  const loadShipmentDetails = async (shipment) => {
    try {
      setLoading(true);
      const response = await api.get(`/Shipment/${shipment.id}`);

      setSelectedShipment(response);

      const products = response.products.map(p => ({
        id: p.expectedProductId,
        name: p.name,
        model: p.model,
        expectedQuantity: p.expectedQuantity || 0,
        scannedCount: p.scannedCount || 0,
        scannedItems: p.scannedItems || []
      }));

      setExpectedProducts(products);

      // Reconstruir historial desde scannedItems
      const allScans = products.flatMap(p =>
        (p.scannedItems || []).map(si => ({
          id: `${p.id}-${si.barcode}`,
          barcode: si.barcode,
          productName: p.name,
          ts: new Date(si.scannedAt).getTime(),
          scannedAt: new Date(si.scannedAt).toLocaleTimeString('es-CO')
        }))
      );

      allScans.sort((a, b) => b.ts - a.ts);
      setScannedItems(allScans);

      // Si solo queda una referencia por llenar, se deja seleccionada para no hacer clic de más
      const open = products.filter(p => !(p.expectedQuantity > 0 && p.scannedCount >= p.expectedQuantity));
      setSelectedProductId(open.length === 1 ? open[0].id : '');
      setLastResult(null);
      setShowShipmentSelector(false);
    } catch (error) {
      toast.error('Error al cargar el envío: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Al venir de "Crear envío" se abre directamente el envío recién creado
  const initialShipmentId = searchParams.get('shipmentId');
  useEffect(() => {
    if (initialShipmentId) loadShipmentDetails({ id: initialShipmentId });
  }, [initialShipmentId]);

  const showFlash = (ok) => setFlash({ ok, key: Date.now() });

  // ─── Escanear producto ────────────────────────────────────────────────────
  const handleScan = async (e) => {
    e.preventDefault();
    if (!barcode.trim()) return;
    if (!selectedProductId) {
      beep(false);
      showFlash(false);
      setLastResult({ ok: false, code: barcode.trim(), message: 'Primero toca la referencia que vas a escanear' });
      setBarcode('');
      return;
    }

    const code = barcode.trim();
    setLoading(true);
    try {
      const response = await api.post(`/Shipment/${selectedShipment.id}/scan`, {
        expectedProductId: parseInt(selectedProductId),
        barcode: code
      });

      const product = expectedProducts.find(p => p.id == selectedProductId);
      const newItem = {
        id: Date.now(),
        ts: Date.now(),
        barcode: code,
        productName: product.name,
        scannedAt: new Date().toLocaleTimeString('es-CO')
      };

      setScannedItems(prev => [newItem, ...prev]);
      setExpectedProducts(prev => prev.map(p =>
        p.id == selectedProductId
          ? { ...p, scannedCount: response.scannedCount ?? (p.scannedCount || 0) + 1 }
          : p
      ));

      beep(true);
      showFlash(true);
      const expected = response.expectedQuantity || product.expectedQuantity;
      const isComplete = expected && response.scannedCount >= expected;
      setLastResult({
        ok: true,
        code,
        message: isComplete
          ? `${product.name} completo: ${fmt(expected)} unidades`
          : `${product.name}${expected ? ` · ${fmt(response.scannedCount)} de ${fmt(expected)}` : ''}`,
        complete: isComplete
      });
      if (isComplete) setSelectedProductId('');
    } catch (error) {
      beep(false);
      showFlash(false);
      setLastResult({ ok: false, code, message: error.message || 'Error al registrar el escaneo' });
    } finally {
      // Se limpia también en error para que el siguiente pistolazo no se pegue al serial malo
      setBarcode('');
      setLoading(false);
    }
  };

  // ─── Auto-focus ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!showShipmentSelector && selectedShipment) {
      inputRef.current?.focus();
      const interval = setInterval(() => {
        // no roba el foco si el usuario está escribiendo en otro campo
        if (document.activeElement?.tagName !== 'INPUT') inputRef.current?.focus();
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [showShipmentSelector, selectedShipment, selectedProductId]);

  const finishShipment = async () => {
    if (pendingProducts.length > 0) {
      const detail = pendingProducts
        .map(p => `• ${p.name}: ${p.scannedCount}/${p.expectedQuantity}`)
        .join('\n');
      if (!window.confirm(`El envío está incompleto:\n${detail}\n\n¿Finalizarlo de todas formas?`)) return;
    }
    try {
      await api.post(`/Shipment/${selectedShipment.id}/complete`);
      toast.success(`Envío ${selectedShipment.shipmentNumber} finalizado con ${fmt(totalScanned)} unidades`);
      setShowShipmentSelector(true);
      loadShipments();
    } catch (error) {
      toast.error('Error al finalizar el envío: ' + error.message);
    }
  };

  // ─── Cálculos ─────────────────────────────────────────────────────────────
  const totalScanned = expectedProducts.reduce((sum, p) => sum + (p.scannedCount || 0), 0);
  const totalExpected = expectedProducts.reduce((sum, p) => sum + (p.expectedQuantity || 0), 0);
  const progressPercent = percentOf(totalScanned, totalExpected);
  const pendingProducts = expectedProducts.filter(p => p.expectedQuantity > 0 && p.scannedCount < p.expectedQuantity);
  const selectedProduct = expectedProducts.find(p => p.id == selectedProductId);

  // ─── SELECTOR DE ENVÍO ────────────────────────────────────────────────────
  if (showShipmentSelector) {
    return (
      <div className="scan-select animate-slide-up">
        <header className="page-header">
          <div>
            <h1 className="page-title">¿Qué envío vas a cargar?</h1>
            <p className="page-subtitle">{shipments.length} envíos activos · toca uno para empezar a escanear</p>
          </div>
          <button className="btn btn-glass" onClick={loadShipments} disabled={loadingShipments}>
            <RefreshCw size={16} className={loadingShipments ? 'spin' : ''} /> Actualizar
          </button>
        </header>

        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por número de envío, placa, conductor o transportadora"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            autoFocus
          />
          <div className="chip-group" role="radiogroup" aria-label="Buscar en">
            {SEARCH_TYPES.map(t => (
              <button key={t.value} type="button" role="radio" aria-checked={searchType === t.value}
                className={`chip ${searchType === t.value ? 'is-active' : ''}`}
                onClick={() => setSearchType(t.value)}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {loadingShipments ? (
          <div className="ship-grid">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="ship-card skeleton" />)}
          </div>
        ) : filteredShipments.length === 0 ? (
          <div className="empty-big">
            <PackageOpen size={44} />
            <p className="empty-big-title">{shipments.length === 0 ? 'No hay envíos activos' : 'Ningún envío coincide'}</p>
            <p>{shipments.length === 0 ? 'Cuando un supervisor cree un envío aparecerá aquí.' : 'Prueba con otro número, placa o conductor.'}</p>
          </div>
        ) : (
          <div className="ship-grid">
            {filteredShipments.map(shipment => {
              const pct = percentOf(shipment.totalScanned, shipment.totalExpected);
              const tone = toneOf(pct, shipment.totalExpected);
              return (
                <button key={shipment.id} className={`ship-card ship-card--${tone}`}
                  onClick={() => loadShipmentDetails(shipment)} disabled={loading}>
                  <div className="ship-card-top">
                    <div>
                      <div className="ship-card-number mono">{shipment.shipmentNumber}</div>
                      <div className="ship-card-carrier">{shipment.carrier || 'Sin transportadora'}</div>
                    </div>
                    <span className={`pct-badge pct-badge--${tone}`}>
                      {shipment.totalExpected ? `${pct}%` : 'Abierto'}
                    </span>
                  </div>
                  <div className="ship-card-meta">
                    <span><User size={14} /> {shipment.driverName}</span>
                    <span><Truck size={14} /> {shipment.vehiclePlate}</span>
                  </div>
                  <div className={`progress progress--${tone === 'open' ? 'active' : tone}`}>
                    <span style={{ width: `${pct}%` }} />
                  </div>
                  <div className="ship-card-foot">
                    <span className="tabular"><strong>{fmt(shipment.totalScanned)}</strong> / {shipment.totalExpected ? fmt(shipment.totalExpected) : '—'} und</span>
                    <span className="ship-card-go">Escanear <ChevronRight size={15} /></span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ─── MODO GUARDA ───────────────────────────────────────────────────────────
  const readyToScan = Boolean(selectedProductId);

  return (
    <div className="guard">
      {flash && <div key={flash.key} className={`scan-flash scan-flash--${flash.ok ? 'ok' : 'error'}`} />}

      <header className="guard-head">
        <button className="guard-back" onClick={() => setShowShipmentSelector(true)}>
          <ChevronLeft size={18} /> Envíos
        </button>
        <div className="guard-ship">
          <span className="guard-eyebrow">Envío en carga</span>
          <h1 className="guard-ship-number mono">{selectedShipment?.shipmentNumber}</h1>
          <div className="guard-ship-meta">
            <span><Truck size={15} /> {selectedShipment?.carrier}</span>
            <span><User size={15} /> {selectedShipment?.driverName}</span>
            <span><CreditCard size={15} /> {selectedShipment?.vehiclePlate}</span>
          </div>
        </div>
        <div className="guard-total">
          <div className="guard-total-value tabular">
            {fmt(totalScanned)}<span> / {totalExpected ? fmt(totalExpected) : '—'}</span>
          </div>
          <div className="guard-total-label">unidades cargadas{totalExpected ? ` · ${progressPercent}%` : ''}</div>
          <div className={`progress progress--dark progress--${toneOf(progressPercent, totalExpected) === 'open' ? 'active' : toneOf(progressPercent, totalExpected)}`}>
            <span style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </header>

      <div className="guard-body">
        <section className="guard-main">
          <div className="guard-step">
            <span className="step-num">1</span>
            <span>Toca la referencia que vas a cargar</span>
          </div>
          <div className="ref-grid">
            {expectedProducts.map(product => {
              const isSelected = selectedProductId == product.id;
              const pct = percentOf(product.scannedCount, product.expectedQuantity);
              const tone = toneOf(pct, product.expectedQuantity);
              const isComplete = tone === 'done';
              return (
                <button
                  key={product.id}
                  type="button"
                  disabled={isComplete}
                  className={`ref-card ref-card--${tone} ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => { setSelectedProductId(product.id); inputRef.current?.focus(); }}
                  aria-pressed={isSelected}
                >
                  <div className="ref-ring">
                    <Ring pct={product.expectedQuantity ? pct : 0} tone={tone} />
                    {isComplete ? <CheckCircle2 size={20} className="ref-ring-icon" /> : <span className="ref-ring-pct">{product.expectedQuantity ? `${pct}%` : '∞'}</span>}
                  </div>
                  <div className="ref-info">
                    <div className="ref-name">{product.name}</div>
                    <div className="ref-model mono">{product.model}</div>
                  </div>
                  <div className="ref-count tabular">
                    {fmt(product.scannedCount)}
                    {product.expectedQuantity > 0 && <span>/ {fmt(product.expectedQuantity)}</span>}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="guard-step">
            <span className="step-num">2</span>
            <span>Escanea el serial con la pistola</span>
          </div>
          <form onSubmit={handleScan} className={`scan-box ${readyToScan ? 'is-ready' : 'is-waiting'}`}>
            <ScanBarcode size={30} className="scan-box-icon" />
            <input
              ref={inputRef}
              type="text"
              className="scan-input mono"
              placeholder={readyToScan ? 'Esperando lectura…' : 'Primero elige una referencia'}
              value={barcode}
              onChange={e => setBarcode(e.target.value)}
              disabled={loading}
              autoComplete="off"
              spellCheck="false"
              aria-label="Serial escaneado"
            />
            <span className="scan-status">
              <span className="scan-status-dot" />
              {readyToScan ? `Cargando: ${selectedProduct?.name}` : 'Sin referencia'}
            </span>
          </form>

          {lastResult && (
            <div key={lastResult.code + lastResult.ok} className={`last-scan ${lastResult.ok ? 'is-ok' : 'is-error'}`}>
              {lastResult.ok ? <CheckCircle2 size={34} /> : <XCircle size={34} />}
              <div className="last-scan-text">
                <span className="last-scan-code mono">{lastResult.code}</span>
                <span className="last-scan-msg">{lastResult.message}</span>
              </div>
            </div>
          )}
        </section>

        <aside className="guard-side">
          <div className="history">
            <div className="history-head">
              <span><History size={16} /> Últimos escaneos</span>
              <span className="history-count tabular">
                {scannedItems.length > HISTORY_LIMIT ? `${HISTORY_LIMIT} de ${fmt(scannedItems.length)}` : fmt(scannedItems.length)}
              </span>
            </div>
            {scannedItems.length === 0 ? (
              <div className="history-empty">Aún no hay escaneos en este envío</div>
            ) : (
              <ol className="history-list">
                {scannedItems.slice(0, HISTORY_LIMIT).map((item, i) => (
                  <li key={item.id} className={i === 0 ? 'is-new' : ''}>
                    <span className="history-code mono">{item.barcode}</span>
                    <span className="history-product">{item.productName}</span>
                    <span className="history-time tabular">{item.scannedAt}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <button className={`finish-btn ${pendingProducts.length === 0 && totalScanned > 0 ? 'is-ready' : ''}`}
            onClick={finishShipment} disabled={totalScanned === 0}>
            <CircleCheck size={20} />
            {pendingProducts.length === 0 && totalScanned > 0 ? 'Finalizar envío' : 'Finalizar envío (incompleto)'}
          </button>
        </aside>
      </div>
    </div>
  );
};

export default Scanner;
