import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    activeShipmentsCount: 0,
    completedShipmentsCount: 0,
    totalShipmentsToday: 0,
    totalProductsScannedToday: 0,
    topCarriers: [],
    topProducts: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get('/Shipment/dashboard/stats');
        if (data) setStats(data);
      } catch (error) {
        console.error("Dashboard error:", error);
        toast.error('Error al conectar con la API para cargar métricas.');
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Polling 10s
    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ icon, title, value, colorClass }) => (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div className={`icon-wrapper ${colorClass}`} style={{ padding: '1rem', borderRadius: '50%', background: 'var(--bg-surface-hover)' }}>
        {icon}
      </div>
      <div>
        <p className="text-secondary" style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.25rem' }}>{title}</p>
        <h3 style={{ fontSize: '2rem', margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>{value}</h3>
      </div>
    </div>
  );

  return (
    <div className="animate-slide-up" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 className="text-primary" style={{ fontSize: '2.5rem', letterSpacing: '-0.04em', fontWeight: 700 }}>Dashboard</h1>
        <p className="text-secondary" style={{ fontSize: '1.1rem' }}>Visión general del inventario de salidas en tiempo real.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <StatCard icon={<Truck size={32} className="text-primary" />} title="Envíos Activos" value={stats.activeShipmentsCount} colorClass="text-primary" />
        <StatCard icon={<CheckCircle size={32} className="text-success" />} title="Completados" value={stats.completedShipmentsCount} colorClass="text-success" />
        <StatCard icon={<Package size={32} className="text-warning" />} title="Total Hoy" value={stats.totalShipmentsToday} colorClass="text-warning" />
        <StatCard icon={<BarChart3 size={32} className="text-primary" />} title="Items Escaneados" value={stats.totalProductsScannedToday} colorClass="text-primary" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.4rem', fontWeight: 600 }}>Transportadoras Top</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stats.topCarriers && stats.topCarriers.length > 0 ? stats.topCarriers.map((c, i) => (
              <li key={i} style={{ 
                padding: '1rem', background: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)', 
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', fontWeight: 500 
              }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                   <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>#{i+1}</span> 
                   <span>{c.name || c}</span>
                </div>
                {c.count !== undefined && <span className="text-muted" style={{ fontSize: '0.9rem' }}>{c.count} envíos</span>}
              </li>
            )) : <li className="text-muted">No hay datos</li>}
          </ul>
        </div>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.4rem', fontWeight: 600 }}>Equipos más despachados</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stats.topProducts && stats.topProducts.length > 0 ? stats.topProducts.map((p, i) => (
              <li key={i} style={{ 
                padding: '1rem', background: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)', 
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', fontWeight: 500 
              }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                   <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>#{i+1}</span> 
                   <span>{p.name || p}</span>
                </div>
                {p.count !== undefined && <span className="text-muted" style={{ fontSize: '0.9rem' }}>{p.count} unds</span>}
              </li>
            )) : <li className="text-muted">No hay datos</li>}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
