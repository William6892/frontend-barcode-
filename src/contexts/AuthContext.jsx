// contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const getUserFromToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.userId || payload.id,
        username: payload.username || payload.unique_name || 'Usuario',
        role: payload.role || payload.roles || 'User',
        email: payload.email || ''
      };
    } catch {
      return null;
    }
  };

  // 🔥 VALIDAR TOKEN CONTRA EL BACKEND
  useEffect(() => {
    const validateToken = async () => {
      const storedToken = localStorage.getItem('token');
      
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7131/api';
        const res = await fetch(`${API_URL}/Auth/validate`, {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });

        if (res.ok) {
          // Token válido
          const userData = getUserFromToken(storedToken);
          setToken(storedToken);
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          // Token inválido o expirado
          console.warn('Token inválido, limpiando sesión');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      } catch (error) {
        console.error('Error validando token:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, []);

  // Efecto para sincronizar token con localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      if (!user) {
        const userData = getUserFromToken(token);
        if (userData) {
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        }
      }
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  }, [token]);

  const login = async (username, password) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7131/api';
      const res = await fetch(`${API_URL}/Auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || 'Credenciales incorrectas');
      }

      const data = await res.json();
      const userData = getUserFromToken(data.token);
      
      setToken(data.token);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isAdmin = user?.role === 'Admin';

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'var(--bg-app)',
        color: 'var(--text-primary)'
      }}>
        <div>
          <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto 1rem' }}></div>
          <p>Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      token,
      user,
      login,
      logout,
      isAuthenticated: !!token,
      isAdmin,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};