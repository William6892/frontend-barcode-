import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthLayout = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Background Decorators */}
      <div 
        style={{ 
          position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', 
          filter: 'blur(100px)', opacity: 0.2, pointerEvents: 'none',
          background: 'var(--color-primary)', top: '-10%', left: '-10%' 
        }} 
      />
      <div 
        style={{ 
          position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', 
          filter: 'blur(100px)', opacity: 0.1, pointerEvents: 'none',
          background: 'var(--color-success)', bottom: '-10%', right: '-10%' 
        }} 
      />
      
      <div style={{ zIndex: 10, width: '100%', maxWidth: '420px', padding: '0 20px' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
