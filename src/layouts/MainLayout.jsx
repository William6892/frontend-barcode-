// layouts/MainLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Truck, ScanLine, FileSearch, LogOut, Users,
  Menu, ChevronDown, Package, PanelLeftClose
} from 'lucide-react';
import samsungLogo from '../assets/samsung-logo.png';
import { api } from '../services/api';
import './MainLayout.css';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/shipments/new': 'Nuevo envío',
  '/scanner': 'Escáner de despacho',
  '/audit': 'Auditoría',
  '/users': 'Usuarios',
};

const isMobile = () => window.matchMedia('(max-width: 900px)').matches;

const MainLayout = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => !isMobile());
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalShipments, setTotalShipments] = useState(0);
  const [userData, setUserData] = useState({ username: 'Usuario', role: 'Inspector' });

  // ✅ Obtener datos del token (seguro, sin guardar en localStorage)
  const getUserDataFromToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return { username: 'Usuario', role: 'Inspector' };

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        username: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name']
          || payload.username
          || 'Usuario',
        role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
          || payload.role
          || 'Inspector'
      };
    } catch (e) {
      console.error('Error decodificando token:', e);
      return { username: 'Usuario', role: 'Inspector' };
    }
  };

  useEffect(() => {
    const data = getUserDataFromToken();
    setUserData(data);
    loadStats();
  }, []);

  // En celular el menú se cierra solo al navegar
  useEffect(() => {
    if (isMobile()) setSidebarOpen(false);
    setShowUserMenu(false);
  }, [location.pathname]);

  const loadStats = async () => {
    try {
      const stats = await api.get('/Shipment/dashboard/stats');
      if (stats) {
        setTotalProducts(stats.totalProductsScannedToday || 0);
        setTotalShipments(stats.totalShipmentsToday || 0);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // ✅ Determinar si es Admin desde el token
  const isAdmin = userData.role?.toLowerCase() === 'admin';
  const isManager = isAdmin || userData.role?.toLowerCase() === 'supervisor';

  // ✅ Items de navegación
  const navItems = [
    { to: '/dashboard', icon: <LayoutDashboard size={19} />, label: 'Dashboard' },
    ...(isManager ? [{ to: '/shipments/new', icon: <Truck size={19} />, label: 'Nuevo envío' }] : []),
    { to: '/scanner', icon: <ScanLine size={19} />, label: 'Escáner' },
    { to: '/audit', icon: <FileSearch size={19} />, label: 'Auditoría' },
  ];

  if (isAdmin) {
    navItems.push({ to: '/users', icon: <Users size={19} />, label: 'Usuarios' });
  }

  const pageTitle = PAGE_TITLES[location.pathname] || 'Control de Salidas';
  const formatNumber = (n) => n.toLocaleString('es-CO');

  return (
    <div className={`main-layout ${sidebarOpen ? 'sidebar-is-open' : ''}`}>
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-brand">
          <img src={samsungLogo} alt="Samsung" className="brand-logo-img" />
          <div className="brand-product">
            <span className="brand-product-name">Control de Salidas</span>
            <span className="brand-product-tag">Despachos · 3PL</span>
          </div>
        </div>

        <nav className="nav-menu">
          <span className="nav-section">Operación</span>
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
          <div className="sidebar-user">
            <div className="user-avatar-small">{getInitials(userData.username)}</div>
            <div className="sidebar-user-text">
              <span className="sidebar-user-name">{userData.username}</span>
              <span className="sidebar-user-role">{userData.role}</span>
            </div>
          </div>
          <button onClick={logout} className="logout-btn">
            <LogOut size={18} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

      <div className="main-column">
        <header className="top-bar">
          <div className="top-bar-left">
            <button
              className="menu-toggle"
              aria-label={sidebarOpen ? 'Ocultar menú' : 'Mostrar menú'}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <PanelLeftClose size={20} /> : <Menu size={20} />}
            </button>
            <h2 className="top-bar-title">{pageTitle}</h2>
          </div>

          <div className="top-bar-right">
            <div className="stats-indicators">
              <div className="stat-pill" title="Unidades escaneadas hoy">
                <span className="live-dot" />
                <Package size={15} />
                <span className="stat-pill-value tabular">{formatNumber(totalProducts)}</span>
                <span className="stat-pill-label">escaneadas hoy</span>
              </div>
              <div className="stat-pill" title="Envíos creados hoy">
                <Truck size={15} />
                <span className="stat-pill-value tabular">{formatNumber(totalShipments)}</span>
                <span className="stat-pill-label">envíos hoy</span>
              </div>
            </div>

            <div className="user-menu-container">
              <button
                className="user-menu-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="user-avatar-small">
                  {getInitials(userData.username)}
                </div>
                <div className="user-info-top">
                  <span className="user-name-top">{userData.username}</span>
                  <span className="user-role-top">{userData.role}</span>
                </div>
                <ChevronDown size={16} className={`chevron ${showUserMenu ? 'rotated' : ''}`} />
              </button>

              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">
                      {getInitials(userData.username)}
                    </div>
                    <div>
                      <div className="dropdown-name">{userData.username}</div>
                      <div className="dropdown-role">{userData.role}</div>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <button onClick={logout} className="dropdown-item logout">
                    <LogOut size={16} />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
