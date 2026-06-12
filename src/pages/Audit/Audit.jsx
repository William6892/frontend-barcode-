import React, { useState } from 'react';
import { Search, Filter, Box } from 'lucide-react';

const Audit = () => {
  const [query, setQuery] = useState('');
  
  const mockResults = [
    { serial: 'SN-12345', product: 'S25 Ultra', shipment: 'ENV-001', plate: 'KZT999', date: '2026-06-11 10:30', status: 'En Ruta' },
    { serial: 'SN-12346', product: 'Galaxy Watch', shipment: 'ENV-001', plate: 'KZT999', date: '2026-06-11 10:31', status: 'En Ruta' },
    { serial: 'SN-99999', product: 'Galaxy Buds', shipment: 'ENV-002', plate: 'XYZ123', date: '2026-06-10 15:00', status: 'Entregado' },
    { serial: 'SN-10022', product: 'Z Fold 6', shipment: 'ENV-003', plate: 'AAA111', date: '2026-06-11 08:15', status: 'Preparación' },
  ];

  return (
    <div className="animate-slide-up" style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '3rem' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 className="text-primary" style={{ fontSize: '2.5rem', letterSpacing: '-0.04em', fontWeight: 700 }}>Auditoría</h1>
        <p className="text-secondary" style={{ fontSize: '1.1rem' }}>Rastrea el ciclo de vida de cualquier serial o vehículo.</p>
      </header>

      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
          <div style={{ position: 'relative' }}>
            <Search size={22} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Buscar por serial de equipo, número de envío o placa..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '3.5rem', fontSize: '1.1rem', background: 'var(--bg-app)' }}
            />
          </div>
        </div>
        <button className="btn btn-primary" style={{ padding: '1rem 2rem' }}><Filter size={20} /> Filtrar</button>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: 'var(--bg-surface-active)' }}>
            <tr>
              <th style={{ padding: '1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Identificador</th>
              <th style={{ padding: '1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Logística</th>
              <th style={{ padding: '1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fecha de Escaneo</th>
              <th style={{ padding: '1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estado Actual</th>
            </tr>
          </thead>
          <tbody>
            {mockResults.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid var(--border-glass)', transition: 'background 0.2s' }}>
                <td style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.5rem', background: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)', color: 'var(--color-primary)' }}>
                      <Box size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{item.serial}</div>
                      <div className="text-muted" style={{ fontSize: '0.9rem' }}>{item.product}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{item.shipment}</span>
                    <span className="text-secondary" style={{ fontSize: '0.9rem' }}>Placa: {item.plate}</span>
                  </div>
                </td>
                <td style={{ padding: '1.5rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{item.date}</td>
                <td style={{ padding: '1.5rem' }}>
                  <span style={{ 
                    padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', fontSize: '0.9rem', fontWeight: 600,
                    background: item.status === 'En Ruta' ? 'var(--color-warning-bg)' : 
                               item.status === 'Entregado' ? 'var(--color-success-bg)' : 'var(--bg-surface-active)',
                    color: item.status === 'En Ruta' ? 'var(--color-warning)' : 
                           item.status === 'Entregado' ? 'var(--color-success)' : 'var(--text-primary)'
                  }}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Audit;
