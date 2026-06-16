// layouts/MainLayout.jsx
import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, Truck, ScanLine, FileSearch, LogOut, User,
  Bell, Menu, X, ChevronDown, Package, ArrowRightCircle
} from 'lucide-react';
import samsungLogo from '../assets/samsung-logo.png';
import './MainLayout.css';

const MainLayout = () => {
  const { logout, user } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const getInitials = (name) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const navItems = [
    { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/shipments/new', icon: <Truck size={20} />, label: 'Envíos' },
    { to: '/scanner', icon: <ScanLine size={20} />, label: 'Escáner' },
    { to: '/audit', icon: <FileSearch size={20} />, label: 'Auditoría' },
    { to: '/users', icon: <User size={20} />, label: 'Usuarios' },
  ];

  return (
    <div className="main-layout">
      {/* TOP BAR */}
      <header className="top-bar">
        <div className="top-bar-left">
          <button 
            className="menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="brand">
            <img 
              src={samsungLogo} 
              alt="Samsung" 
              className="brand-logo-img"
            />
            <div className="brand-text">
              <div className="brand-title-wrapper">
                <Package size={18} className="brand-icon-title" />
                <span className="brand-title">Control de Productos</span>
              </div>
              <div className="brand-subtitle-wrapper">
                <ArrowRightCircle size={12} className="brand-arrow" />
                <span className="brand-badge">Gestión de Salidas</span>
              </div>
            </div>
          </div>
        </div>

        <div className="top-bar-right">
          {/* Indicador de inventario en vivo */}
          <div className="inventory-indicator">
            <span className="inventory-dot"></span>
            <span className="inventory-text">12 productos</span>
          </div>

          <button className="icon-btn">
            <Bell size={20} />
            <span className="notification-dot">3</span>
          </button>

          <div className="user-menu-container">
            <button 
              className="user-menu-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="user-avatar-small">
                {getInitials(user?.name)}
              </div>
              <div className="user-info-top">
                <span className="user-name-top">{user?.name || 'Administrador'}</span>
                <span className="user-role-top">{user?.role || 'Admin'}</span>
              </div>
              <ChevronDown size={16} className={`chevron ${showUserMenu ? 'rotated' : ''}`} />
            </button>

            {showUserMenu && (
              <div className="user-dropdown">
                <div className="dropdown-header">
                  <div className="dropdown-avatar">
                    {getInitials(user?.name)}
                  </div>
                  <div>
                    <div className="dropdown-name">{user?.name || 'Administrador'}</div>
                    <div className="dropdown-role">{user?.role || 'Admin'}</div>
                  </div>
                </div>
                <div className="dropdown-divider" />
                <button className="dropdown-item">
                  <User size={16} />
                  <span>Mi Perfil</span>
                </button>
                <button onClick={logout} className="dropdown-item logout">
                  <LogOut size={16} />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <div className="main-container">
        {/* SIDEBAR */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <nav className="nav-menu">
            {navItems.map((item) => (
              <NavLink 
                key={item.to} 
                to={item.to}
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="sidebar-footer">
            <button onClick={logout} className="logout-btn">
              <LogOut size={20} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </aside>

        {/* CONTENIDO */}
        <main className={`main-content ${sidebarOpen ? 'with-sidebar' : 'full-width'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;