import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { ScanLine } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

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

  return (
    <div className="glass-panel animate-slide-up" style={{ padding: '2.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div 
          style={{ 
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'var(--color-primary-glow)', color: 'var(--color-primary)',
            boxShadow: 'var(--shadow-glow)', marginBottom: '1rem'
          }}
        >
          <ScanLine size={32} />
        </div>
        <h1 style={{ fontSize: '1.75rem' }}>Iniciar Sesión</h1>
        <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
          Ingresa tus credenciales para continuar
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="input-group" style={{ marginBottom: 0 }}>
          <label className="input-label">Usuario</label>
          <input 
            type="text" 
            className="input-field" 
            placeholder="admin" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        
        <div className="input-group" style={{ marginBottom: '0.5rem' }}>
          <label className="input-label">Contraseña</label>
          <input 
            type="password" 
            className="input-field" 
            placeholder="••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary w-full" style={{ padding: '0.875rem', marginTop: '0.5rem' }} disabled={isLoading}>
          {isLoading ? 'Verificando...' : 'Entrar al Sistema'}
        </button>
      </form>
    </div>
  );
};

export default Login;
