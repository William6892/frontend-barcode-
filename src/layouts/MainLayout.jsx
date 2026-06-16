// layouts/MainLayout.jsx - VERSIÓN SIMPLE
import React, { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, Truck, ScanLine, FileSearch, LogOut, User,
  Menu, X, ChevronDown, Package, ArrowRightCircle
} from 'lucide-react';
import samsungLogo from '../assets/samsung-logo.png';
import { api } from '../services/api';
import './MainLayout.css';

const MainLayout = () => {
  const { logout, user } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalShipments, setTotalShipments] = useState(0);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const stats = await api.get('/shipments/stats');
      if (stats.success) {
        setTotalProducts(stats.totalProducts || 0);
        setTotalShipments(stats.totalShipments || 0);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

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

          {/* Usuario */}
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

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;