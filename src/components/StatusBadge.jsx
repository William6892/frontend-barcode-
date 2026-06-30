import React from 'react';

export const STATUS_CONFIG = {
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

export default StatusBadge;
