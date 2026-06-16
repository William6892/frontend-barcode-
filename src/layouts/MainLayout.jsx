// layouts/MainLayout.jsx
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
  const { logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalShipments, setTotalShipments] = useState(0);
  const [userData, setUserData] = useState({ username: 'Administrador', role: 'Admin' });

  // ✅ Obtener datos del token (seguro, sin guardar en localStorage)
  const getUserDataFromToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return { username: 'Administrador', role: 'Admin' };
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        username: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] 
          || payload.username 
          || 'Administrador',
        role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] 
          || payload.role 
          || 'Admin'
      };
    } catch (e) {
      console.error('Error decodificando token:', e);
      return { username: 'Administrador', role: 'Admin' };
    }
  };

  useEffect(() => {
    const data = getUserDataFromToken();
    setUserData(data);
    loadStats();
  }, []);

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

  // ✅ Items de navegación
  const navItems = [
    { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/shipments/new', icon: <Truck size={20} />, label: 'Envíos' },
    { to: '/scanner', icon: <ScanLine size={20} />, label: 'Escáner' },
    { to: '/audit', icon: <FileSearch size={20} />, label: 'Auditoría' },
  ];

  if (isAdmin) {
    navItems.push({ to: '/users', icon: <User size={20} />, label: 'Usuarios' });
  }

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
          <div className="stats-indicators">
            <div className="stat-pill">
              <Package size={14} />
              <span>{totalProducts}</span>
            </div>
            <div className="stat-pill">
              <Truck size={14} />
              <span>{totalShipments}</span>
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
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

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