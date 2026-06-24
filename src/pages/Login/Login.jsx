import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { User, Lock, ArrowRight, ScanBarcode, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const { login } = useAuth();
  const usernameRef = useRef(null);

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Por favor ingresa usuario y contraseña');
      return;
    }
    
    try {
      setIsLoading(true);
      await login(username, password);
      toast.success('¡Bienvenido de vuelta!');
    } catch (error) {
      if (error.message.includes('Failed to fetch')) {
         toast.error('Error de red: Verifica que el backend esté corriendo o los permisos de CORS.');
      } else {
         toast.error(error.message || 'Credenciales incorrectas o error en el servidor');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputWrapperStyle = (field) => ({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: focusedField === field ? '#ffffff' : '#f8fafc',
    borderRadius: '14px',
    border: `2px solid ${focusedField === field ? '#2563eb' : '#e2e8f0'}`,
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: focusedField === field ? '0 0 0 4px rgba(37,99,235,0.1)' : 'none',
  });

  const iconStyle = (field) => ({
    position: 'absolute', left: '1rem',
    color: focusedField === field ? '#2563eb' : '#94a3b8',
    transition: 'color 0.25s',
    pointerEvents: 'none',
    zIndex: 1,
  });

  return (
    <div className="animate-slide-up">
      {/* Mobile-only header (when left panel is hidden) */}
      <div className="login-mobile-header" style={{
        display: 'none',
        textAlign: 'center',
        marginBottom: '2rem',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
          marginBottom: '0.75rem',
        }}>
          <ScanBarcode size={28} style={{ color: '#2563eb' }} />
          <span style={{
            fontSize: '1.25rem', fontWeight: 700, color: '#1e293b',
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            SAMSUNG
          </span>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
          Sistema de Control de Salidas
        </p>
      </div>

      {/* Welcome header */}
      <div style={{ marginBottom: '2.25rem' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.625rem',
          marginBottom: '0.75rem',
        }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
          }}>
            <ScanBarcode size={20} color="white" />
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Control de Salidas
          </span>
        </div>

        <h1 style={{
          fontSize: '1.85rem', fontWeight: 700, color: '#0f172a',
          marginBottom: '0.5rem', letterSpacing: '-0.025em',
          lineHeight: 1.2,
        }}>
          Bienvenido de vuelta
        </h1>
        <p style={{
          color: '#64748b', fontSize: '0.95rem', margin: 0,
          lineHeight: 1.5,
        }}>
          Ingresa tus credenciales para acceder al sistema
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Username */}
        <div>
          <label style={{
            display: 'block', fontSize: '0.825rem', fontWeight: 600,
            color: '#475569', marginBottom: '0.5rem', letterSpacing: '0.01em',
          }}>
            Usuario
          </label>
          <div style={inputWrapperStyle('username')}>
            <User size={18} style={iconStyle('username')} />
            <input
              ref={usernameRef}
              type="text"
              placeholder="Ingresa tu usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={() => setFocusedField('username')}
              onBlur={() => setFocusedField(null)}
              style={{
                width: '100%',
                padding: '0.9rem 1rem 0.9rem 3rem',
                border: 'none', outline: 'none',
                background: 'transparent',
                fontSize: '0.95rem', fontFamily: 'inherit',
                color: '#1e293b',
              }}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label style={{
            display: 'block', fontSize: '0.825rem', fontWeight: 600,
            color: '#475569', marginBottom: '0.5rem', letterSpacing: '0.01em',
          }}>
            Contraseña
          </label>
          <div style={inputWrapperStyle('password')}>
            <Lock size={18} style={iconStyle('password')} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              style={{
                width: '100%',
                padding: '0.9rem 3rem 0.9rem 3rem',
                border: 'none', outline: 'none',
                background: 'transparent',
                fontSize: '0.95rem', fontFamily: 'inherit',
                color: '#1e293b',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute', right: '0.875rem',
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#94a3b8', display: 'flex', padding: '4px',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#475569'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '0.95rem',
            marginTop: '0.5rem',
            background: isLoading
              ? '#93c5fd'
              : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '14px',
            fontSize: '1rem',
            fontWeight: 600,
            fontFamily: 'inherit',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: isLoading ? 'none' : '0 4px 16px rgba(37,99,235,0.35)',
            transform: 'translateY(0)',
            letterSpacing: '0.01em',
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(37,99,235,0.4)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(37,99,235,0.35)';
          }}
        >
          {isLoading ? (
            <>
              <div style={{
                width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: 'white', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
              Verificando...
            </>
          ) : (
            <>
              Iniciar Sesión
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      {/* Footer */}
      <div style={{
        textAlign: 'center', marginTop: '2.5rem',
        paddingTop: '1.5rem',
        borderTop: '1px solid #f1f5f9',
      }}>
        <p style={{
          color: '#94a3b8', fontSize: '0.78rem', margin: 0,
          letterSpacing: '0.02em',
        }}>
          Samsung Electronics Colombia · Samcol
        </p>
        <p style={{
          color: '#cbd5e1', fontSize: '0.72rem', margin: '0.3rem 0 0',
        }}>
          Barcode Shipping Control System v1.0
        </p>
      </div>

      {/* Spinner keyframe (for loading state) */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 900px) {
          .login-mobile-header {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
