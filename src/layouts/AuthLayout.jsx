import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthLayout = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#f0f2f5'
    }}>
      {/* ─── LEFT PANEL: Branding ──────────────────────────────── */}
      <div style={{
        flex: '1 1 50%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0b1426 0%, #0f2847 35%, #1a3a6b 65%, #1034a6 100%)',
        padding: '3rem',
      }}>
        {/* Animated scan lines */}
        <div style={{
          position: 'absolute', inset: 0, overflow: 'hidden',
          pointerEvents: 'none', opacity: 0.06,
        }}>
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: 0, right: 0,
              height: '1px',
              background: 'white',
              top: `${(i * 2.5) + 0.5}%`,
            }} />
          ))}
        </div>

        {/* Floating orbs */}
        <div style={{
          position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.25), transparent 70%)',
          top: '-8%', right: '-12%', pointerEvents: 'none',
          animation: 'floatOrb 8s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', width: '300px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.2), transparent 70%)',
          bottom: '-5%', left: '-8%', pointerEvents: 'none',
          animation: 'floatOrb 10s ease-in-out infinite reverse',
        }} />

        {/* Scanning animation line */}
        <div style={{
          position: 'absolute', left: '10%', right: '10%', height: '2px',
          background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.6), transparent)',
          boxShadow: '0 0 20px rgba(59,130,246,0.4)',
          pointerEvents: 'none',
          animation: 'scanLine 4s ease-in-out infinite',
        }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: '440px' }}>
          {/* Samsung Logo */}
          <img
            src="/icons.svg"
            alt=""
            style={{ width: '0px', height: '0px' }}
            onError={() => {}}
          />
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem 2rem', borderRadius: '16px',
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            marginBottom: '2.5rem',
          }}>
            <span style={{
              fontSize: '2rem', fontWeight: 700, color: 'white',
              letterSpacing: '0.15em', textTransform: 'uppercase',
              fontFamily: "'Outfit', sans-serif",
            }}>
              SAMSUNG
            </span>
          </div>

          <h1 style={{
            color: 'white', fontSize: '2.2rem', fontWeight: 700,
            marginBottom: '1rem', letterSpacing: '-0.02em', lineHeight: 1.2,
          }}>
            Sistema de Control<br/>
            <span style={{ color: '#60a5fa' }}>de Salidas</span>
          </h1>

          <p style={{
            color: 'rgba(255,255,255,0.55)', fontSize: '1.05rem',
            lineHeight: 1.7, maxWidth: '380px', margin: '0 auto 2.5rem',
          }}>
            Plataforma de gestión y trazabilidad de envíos con escaneo de códigos de barras en tiempo real.
          </p>

          {/* Feature pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', justifyContent: 'center' }}>
            {['Escaneo en tiempo real', 'Trazabilidad total', 'Reportes CSV', 'Auditoría completa'].map((feat, i) => (
              <span key={i} style={{
                padding: '0.45rem 1rem', borderRadius: '50px',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.8rem', fontWeight: 500,
                backdropFilter: 'blur(4px)',
              }}>
                {feat}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom badge */}
        <div style={{
          position: 'absolute', bottom: '2rem',
          color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem',
          letterSpacing: '0.1em',
        }}>
          SAMCOL · Colombia
        </div>
      </div>

      {/* ─── RIGHT PANEL: Login Form ──────────────────────────── */}
      <div style={{
        flex: '1 1 50%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '3rem 2rem',
        background: '#ffffff',
        position: 'relative',
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <Outlet />
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes floatOrb {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -30px) scale(1.05); }
        }
        @keyframes scanLine {
          0% { top: 10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
        @media (max-width: 900px) {
          div[style*="flex: 1 1 50%"]:first-child {
            display: none !important;
          }
          div[style*="flex: 1 1 50%"]:last-of-type {
            flex: 1 1 100% !important;
            background: linear-gradient(180deg, #0f2847 0%, #1a3a6b 100%) !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AuthLayout;
