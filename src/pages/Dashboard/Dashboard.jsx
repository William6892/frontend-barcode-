import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, BarChart3, TrendingUp, AlertCircle, Plus, ScanLine, FileSearch } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeShipmentsCount: 0,
    completedShipmentsCount: 0,
    totalShipmentsToday: 0,
    totalProductsScannedToday: 0,
    topCarriers: [],
    topProducts: [],
    recentShipments: [],
    weeklyActivity: [],
    avgDeliveryTime: '2.4',
    successRate: '94',
    lowStockProducts: []
  });
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get('/Shipment/dashboard/stats');
        if (data) {
          setStats(data);
          setLastUpdate(new Date());
        }
      } catch (error) {
        console.error("Dashboard error:", error);
        toast.error('Error al cargar métricas.');
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ icon, title, value, trend, color, glowColor }) => (
    <div 
      className="glass-panel stat-card" 
      style={{ 
        padding: '1.5rem', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1.25rem',
        '--glow-color': glowColor,
        '--border-color-hover': `rgb(${color})`,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background soft glow decoration */}
      <div style={{
        position: 'absolute',
        top: '-40%',
        right: '-40%',
        width: '140px',
        height: '140px',
        borderRadius: '50%',
        background: `rgba(${color}, 0.12)`,
        filter: 'blur(35px)',
        pointerEvents: 'none'
      }} />

      <div style={{ 
        padding: '0.85rem', 
        borderRadius: 'var(--radius-lg)', 
        background: `rgba(${color}, 0.08)`,
        border: `1px solid rgba(${color}, 0.15)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 8px 16px -4px rgba(${color}, 0.1)`,
        color: `rgb(${color})`,
        zIndex: 1
      }}>
        {icon}
      </div>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.2rem', zIndex: 1 }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{title}</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', flexWrap: 'wrap' }}>
          <h3 style={{ fontSize: '2.1rem', margin: 0, color: 'var(--text-primary)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1 }}>
            {value}
          </h3>
          {trend && (
            <span style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
              fontSize: '0.72rem', 
              fontWeight: 700,
              color: 'var(--color-success)',
              background: 'var(--color-success-bg)',
              border: '1px solid rgba(5, 150, 105, 0.2)',
              padding: '0.2rem 0.5rem',
              borderRadius: 'var(--radius-full)',
              lineHeight: 1
            }}>
              <TrendingUp size={10} />
              +{trend}%
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="animate-slide-up" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Styles for premium effects */}
      <style>{`
        .stat-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-lg), 0 12px 24px -10px var(--glow-color) !important;
          border-color: var(--border-color-hover) !important;
        }
      `}</style>

      {/* HEADER CON ACCIONES RÁPIDAS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.04em', margin: 0 }}>Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>Visión general en tiempo real</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => navigate('/shipments/new')}>
            <Plus size={16} /> Nuevo Envío
          </button>
          <button className="btn btn-glass" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => navigate('/scanner')}>
            <ScanLine size={16} /> Escanear
          </button>
          <button className="btn btn-glass" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => navigate('/audit')}>
            <FileSearch size={16} /> Auditoría
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <StatCard 
          icon={<Truck size={24} />} 
          title="Envíos Activos" 
          value={stats.activeShipmentsCount} 
          color="37, 99, 235" 
          glowColor="rgba(37, 99, 235, 0.25)" 
        />
        <StatCard 
          icon={<CheckCircle size={24} />} 
          title="Completados" 
          value={stats.completedShipmentsCount} 
          trend={8} 
          color="5, 150, 105" 
          glowColor="rgba(5, 150, 105, 0.25)" 
        />
        <StatCard 
          icon={<Package size={24} />} 
          title="Total Hoy" 
          value={stats.totalShipmentsToday} 
          trend={12} 
          color="217, 119, 6" 
          glowColor="rgba(217, 119, 6, 0.25)" 
        />
        <StatCard 
          icon={<BarChart3 size={24} />} 
          title="Items Escaneados" 
          value={stats.totalProductsScannedToday} 
          color="147, 51, 234" 
          glowColor="rgba(147, 51, 234, 0.25)" 
        />
      </div>

      {/* BAJO STOCK (si hay) */}
      {stats.lowStockProducts?.length > 0 && (
        <div style={{ padding: '0.75rem 1.25rem', background: 'var(--color-danger-bg)', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <AlertCircle size={18} color="var(--color-danger)" />
          <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-danger)' }}>Stock Bajo:</span>
          {stats.lowStockProducts.map((p, i) => (
            <span key={i} style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.5)', padding: '0.15rem 0.6rem', borderRadius: 'var(--radius-full)' }}>
              {p.name}: {p.stock} unds
            </span>
          ))}
        </div>
      )}

      {/* GRÁFICO + LISTAS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        {/* Transportadoras Top */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>🏆 Transportadoras Top</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {stats.topCarriers?.length > 0 ? stats.topCarriers.map((c, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontWeight: 500 }}>#{i+1} {c.name || c}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.count || 0} envíos</span>
              </li>
            )) : <li style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No hay datos</li>}
          </ul>
        </div>

        {/* Equipos más despachados */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>📦 Equipos más despachados</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {stats.topProducts?.length > 0 ? stats.topProducts.map((p, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontWeight: 500 }}>#{i+1} {p.name || p}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.count || 0} unds</span>
              </li>
            )) : <li style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No hay datos</li>}
          </ul>
        </div>
      </div>

      {/* Últimos Envíos */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>📋 Últimos Envíos</h3>
          <button className="btn btn-glass" style={{ padding: '0.2rem 0.8rem', fontSize: '0.7rem' }}>Ver todos</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {stats.recentShipments?.length > 0 ? stats.recentShipments.slice(0, 5).map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0.75rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>#{s.shipmentNumber}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.carrier}</span>
              <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.5rem', borderRadius: 'var(--radius-full)',
                background: s.status === 'completed' ? 'var(--color-success-bg)' : 'var(--color-warning-bg)',
                color: s.status === 'completed' ? 'var(--color-success)' : 'var(--color-warning)'
              }}>
                {s.status === 'completed' ? '✅' : '⏳'} {s.status}
              </span>
            </div>
          )) : <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No hay envíos recientes</div>}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;