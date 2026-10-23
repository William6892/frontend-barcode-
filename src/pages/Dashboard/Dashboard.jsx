import React, { useState, useEffect, useRef } from 'react';
import { Package, Truck, CheckCircle2, ScanLine, Plus, FileSearch, ArrowRight, Trophy, Boxes } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Dashboard.css';

const fmt = (n) => (n ?? 0).toLocaleString('es-CO');

// Número que sube desde el valor anterior al nuevo (solo decoración, el dato real ya está en `value`)
const CountUp = ({ value }) => {
  const [shown, setShown] = useState(value);
  const fromRef = useRef(value);
  useEffect(() => {
    const from = fromRef.current;
    if (from === value) return;
    const start = performance.now();
    let frame;
    const tick = (t) => {
      const k = Math.min(1, (t - start) / 600);
      setShown(Math.round(from + (value - from) * (1 - Math.pow(1 - k, 3))));
      if (k < 1) frame = requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return fmt(shown);
};

const KpiCard = ({ icon, label, value, tone, hint }) => (
  <div className={`kpi kpi--${tone}`}>
    <div className="kpi-head">
      <span className="kpi-label">{label}</span>
      <span className="kpi-icon">{icon}</span>
    </div>
    <div className="kpi-value tabular"><CountUp value={value} /></div>
    {hint && <div className="kpi-hint">{hint}</div>}
  </div>
);

// Barras de unidades escaneadas por hora (una sola serie: un solo tono, sin leyenda)
const HourlyChart = ({ data }) => {
  const [hover, setHover] = useState(null);
  const W = 720, H = 220, padL = 36, padB = 26, padT = 12;
  const max = Math.max(10, ...data.map(d => d.count));
  const step = Math.pow(10, Math.floor(Math.log10(max)));
  const top = Math.ceil(max / step) * step;
  const ticks = [0, top / 2, top];
  const slot = (W - padL) / Math.max(1, data.length);
  const barW = Math.max(4, slot - 4);
  const y = (v) => padT + (H - padT - padB) * (1 - v / top);
  const peak = data.reduce((best, d, i) => (d.count > (data[best]?.count ?? -1) ? i : best), 0);
  const hourLabel = (iso) => new Date(iso).toLocaleTimeString('es-CO', { hour: 'numeric', hour12: true }).replace(/\s?([ap])\.?\s?m\.?/i, '$1m');

  if (data.length === 0) return <div className="empty-state">Sin escaneos en las últimas 24 horas</div>;

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="hourly-chart" role="img"
        aria-label="Unidades escaneadas por hora en las últimas 24 horas">
        {ticks.map(t => (
          <g key={t}>
            <line x1={padL} x2={W} y1={y(t)} y2={y(t)} className="chart-grid" />
            <text x={padL - 8} y={y(t) + 4} className="chart-axis" textAnchor="end">{fmt(t)}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const x = padL + i * slot + 2;
          const h = Math.max(d.count > 0 ? 3 : 0, H - padB - y(d.count));
          return (
            <g key={d.hourUtc}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}>
              {/* zona de hover más ancha que la barra */}
              <rect x={x - 2} y={padT} width={slot} height={H - padT - padB} fill="transparent" />
              <path
                className={`chart-bar ${hover === i ? 'is-hover' : ''} ${i === data.length - 1 ? 'is-current' : ''}`}
                d={`M${x},${H - padB} v${-(h - Math.min(4, h))} q0,${-Math.min(4, h)} ${Math.min(4, barW / 2)},${-Math.min(4, h)} h${barW - 2 * Math.min(4, barW / 2)} q${Math.min(4, barW / 2)},0 ${Math.min(4, barW / 2)},${Math.min(4, h)} v${h - Math.min(4, h)} z`}
              />
              {i % 3 === 0 && (
                <text x={x + barW / 2} y={H - 8} className="chart-axis" textAnchor="middle">{hourLabel(d.hourUtc)}</text>
              )}
              {i === peak && d.count > 0 && hover === null && (
                <text x={x + barW / 2} y={y(d.count) - 6} className="chart-peak" textAnchor="middle">{fmt(d.count)}</text>
              )}
            </g>
          );
        })}
      </svg>
      {hover !== null && (
        <div className="chart-tooltip" style={{ left: `${((padL + hover * slot + slot / 2) / W) * 100}%` }}>
          <strong className="tabular">{fmt(data[hover].count)} und</strong>
          <span>{new Date(data[hover].hourUtc).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })} · 1 hora</span>
        </div>
      )}
    </div>
  );
};

const RankList = ({ items, unit }) => {
  const max = Math.max(1, ...items.map(i => i.count || 0));
  if (items.length === 0) return <div className="empty-state">Aún no hay datos</div>;
  return (
    <ol className="rank-list">
      {items.map((it, i) => (
        <li key={it.name}>
          <div className="rank-row">
            <span className="rank-pos">{i + 1}</span>
            <span className="rank-name">{it.name}</span>
            <span className="rank-value tabular">{fmt(it.count)} <small>{unit}</small></span>
          </div>
          <div className="rank-bar"><span style={{ width: `${(it.count / max) * 100}%` }} /></div>
        </li>
      ))}
    </ol>
  );
};

const progressTone = (pct) => (pct >= 100 ? 'done' : pct >= 75 ? 'near' : 'active');

const Dashboard = () => {
  const navigate = useNavigate();
  const { isManager } = useAuth();
  const [stats, setStats] = useState(null);
  const [activeShipments, setActiveShipments] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [, forceTick] = useState(0);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [data, active] = await Promise.all([
          api.get('/Shipment/dashboard/stats'),
          api.get('/Shipment?status=Active&pageSize=100'),
        ]);
        setStats(data);
        setActiveShipments(active);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Dashboard error:', error);
        toast.error('Error al cargar métricas.');
      }
    };
    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    const clock = setInterval(() => forceTick(t => t + 1), 10000);
    return () => { clearInterval(interval); clearInterval(clock); };
  }, []);

  const secondsAgo = lastUpdate ? Math.round((Date.now() - lastUpdate) / 1000) : null;
  const scansByHour = stats?.scansByHour ?? [];
  const lastHour = scansByHour[scansByHour.length - 1]?.count ?? 0;

  const shipmentsWithProgress = activeShipments
    .map(s => ({ ...s, pct: s.totalExpected > 0 ? Math.round((s.totalScanned / s.totalExpected) * 100) : 0 }))
    .sort((a, b) => b.pct - a.pct);

  return (
    <div className="dashboard animate-slide-up">
      <header className="page-header">
        <div>
          <h1 className="page-title">Resumen de despachos</h1>
          <p className="page-subtitle">
            <span className="live-dot" />
            {secondsAgo === null ? 'Cargando…' : secondsAgo < 15 ? 'Actualizado ahora' : `Actualizado hace ${secondsAgo} s`}
            <span className="sep">·</span> se refresca cada 30 s
          </p>
        </div>
        <div className="page-actions">
          {isManager && (
            <button className="btn btn-primary" onClick={() => navigate('/shipments/new')}>
              <Plus size={17} /> Nuevo envío
            </button>
          )}
          <button className="btn btn-glass" onClick={() => navigate('/scanner')}>
            <ScanLine size={17} /> Escanear
          </button>
        </div>
      </header>

      <section className="kpi-grid">
        <KpiCard tone="blue" icon={<Truck size={18} />} label="Envíos activos"
          value={stats?.activeShipmentsCount ?? 0} hint="cargando en bodega" />
        <KpiCard tone="green" icon={<CheckCircle2 size={18} />} label="Completados"
          value={stats?.completedShipmentsCount ?? 0} hint="total histórico" />
        <KpiCard tone="ink" icon={<Package size={18} />} label="Envíos creados hoy"
          value={stats?.totalShipmentsToday ?? 0} />
        <KpiCard tone="blue" icon={<ScanLine size={18} />} label="Unidades escaneadas hoy"
          value={stats?.totalProductsScannedToday ?? 0} hint={`${fmt(lastHour)} en la última hora`} />
      </section>

      <section className="dash-grid">
        <div className="panel panel--chart">
          <div className="panel-head">
            <div>
              <h3 className="panel-title">Unidades escaneadas por hora</h3>
              <p className="panel-sub">Últimas 24 horas</p>
            </div>
          </div>
          <HourlyChart data={scansByHour} />
          {scansByHour.length > 0 && (() => {
            const total = scansByHour.reduce((s, h) => s + h.count, 0);
            const peak = scansByHour.reduce((a, b) => (b.count > a.count ? b : a));
            const activeHours = scansByHour.filter(h => h.count > 0).length;
            return (
              <dl className="chart-summary">
                <div><dt>Total 24 h</dt><dd className="tabular">{fmt(total)} und</dd></div>
                <div>
                  <dt>Hora pico</dt>
                  <dd className="tabular">
                    {new Date(peak.hourUtc).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                    <small> · {fmt(peak.count)} und</small>
                  </dd>
                </div>
                <div><dt>Promedio por hora activa</dt><dd className="tabular">{fmt(Math.round(total / Math.max(1, activeHours)))} und</dd></div>
              </dl>
            );
          })()}
        </div>

        <div className="panel panel--shipments">
          <div className="panel-head">
            <div>
              <h3 className="panel-title">Envíos en curso</h3>
              <p className="panel-sub">{activeShipments.length} activos · ordenados por avance</p>
            </div>
            <button className="link-btn" onClick={() => navigate('/scanner')}>
              Ir al escáner <ArrowRight size={14} />
            </button>
          </div>
          {shipmentsWithProgress.length === 0 ? (
            <div className="empty-state">No hay envíos activos</div>
          ) : (
            <ul className="ship-list">
              {shipmentsWithProgress.slice(0, 6).map(s => (
                <li key={s.id}>
                  <button className="ship-row" onClick={() => navigate(`/scanner?shipmentId=${s.id}`)}>
                    <div className="ship-main">
                      <span className="ship-number mono">{s.shipmentNumber}</span>
                      <span className="ship-meta">{s.carrier} · {s.vehiclePlate}</span>
                    </div>
                    <div className="ship-progress">
                      <div className={`progress progress--${progressTone(s.pct)}`}>
                        <span style={{ width: `${Math.min(100, s.pct)}%` }} />
                      </div>
                      <span className="ship-count tabular">
                        {fmt(s.totalScanned)}<small> / {s.totalExpected ? fmt(s.totalExpected) : '—'}</small>
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3 className="panel-title"><Trophy size={16} /> Transportadoras con más envíos</h3>
          </div>
          <RankList items={stats?.topCarriers ?? []} unit="envíos" />
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3 className="panel-title"><Boxes size={16} /> Referencias más despachadas</h3>
            <button className="link-btn" onClick={() => navigate('/audit')}>
              Auditoría <FileSearch size={14} />
            </button>
          </div>
          <RankList items={stats?.topProducts ?? []} unit="und" />
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
