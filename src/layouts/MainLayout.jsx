import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Truck, ScanLine, FileSearch, LogOut, User } from 'lucide-react'; // ✅ Agregar User
import './MainLayout.css';

const MainLayout = () => {
  const { logout, user } = useAuth();

  const navItems = [
    { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/shipments/new', icon: <Truck size={20} />, label: 'Envíos' },
    { to: '/scanner', icon: <ScanLine size={20} />, label: 'Escáner' },
    { to: '/audit', icon: <FileSearch size={20} />, label: 'Auditoría' },
    { to: '/users', icon: <User size={20} />, label: 'Usuarios' }, // ✅ Ahora User está importado
  ];

  return (
    <div className="main-layout">
      <aside className="sidebar glass-panel">
        <div>
          <div className="sidebar-header">
            <h2 className="sidebar-title text-primary">
              <ScanLine />
              Control UI
            </h2>
            <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
              {user?.name || 'Administrador'}
            </p>
          </div>
          
          <nav className="nav-menu">
            {navItems.map((item) => (
              <NavLink 
                key={item.to} 
                to={item.to}
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              >
                {item.icon}
                <span style={{ fontWeight: 500 }}>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="sidebar-footer">
          <button onClick={logout} className="logout-btn">
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <main className="main-content animate-fade-in">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;