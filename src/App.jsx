import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'; 
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';

import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import ShipmentCreation from './pages/Shipment/ShipmentCreation'; 
import Scanner from './pages/Scanner/Scanner';                    
import Audit from './pages/Audit/Audit';                          
import Users from "./pages/Users/Users";

const getRoleFromToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] 
      || payload.role 
      || payload['role'];
  } catch (e) {
    console.error('Error decodificando token:', e);
    return null;
  }
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  const role = getRoleFromToken();
  console.log('🔍 AdminRoute - Rol del token:', role);
  
  if (role?.toLowerCase() !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>
      
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/shipments/new" element={<ShipmentCreation />} />
        <Route path="/scanner" element={<Scanner />} />
        <Route path="/audit" element={<Audit />} />
        <Route path="/users" element={
          <AdminRoute>
            <Users />
          </AdminRoute>
        } />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <HashRouter> 
        <AppRoutes />
        <Toaster theme="dark" position="top-right" richColors />
      </HashRouter>
    </AuthProvider>
  );
}

export default App;