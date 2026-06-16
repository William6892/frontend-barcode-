// pages/Users/Users.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import './Users.css';
import {
  Edit, Trash2, UserCheck, UserX, Plus, RefreshCw,
  ArrowLeft, Save, User, Mail, Lock, Shield, Search,
  Users as UsersIcon, Eye, ClipboardCheck, BarChart2,
} from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ROLE_CONFIG = {
  Admin:      { avatar: 'av--admin',      badge: 'rb--admin',      icon: <Shield      size={11} /> },
  Supervisor: { avatar: 'av--supervisor', badge: 'rb--supervisor', icon: <BarChart2   size={11} /> },
  Inspector:  { avatar: 'av--inspector',  badge: 'rb--inspector',  icon: <Eye         size={11} /> },
  Auditor:    { avatar: 'av--auditor',    badge: 'rb--auditor',    icon: <ClipboardCheck size={11} /> },
};

const getConfig  = (role) => ROLE_CONFIG[role] ?? {};
const getInitials = (name) => {
  const parts = name?.trim().split(' ') ?? [];
  return parts.length >= 2
    ? parts[0][0].toUpperCase() + parts[1][0].toUpperCase()
    : (parts[0]?.[0] ?? '?').toUpperCase();
};

// ─── Form ────────────────────────────────────────────────────────────────────

const UserForm = ({ editingUser, onClose, onSaved, onCreated }) => {
  const [formData, setFormData] = useState({
    username:        editingUser?.username || '',
    email:           editingUser?.email    || '',
    password:        '',
    confirmPassword: '',
    role:            editingUser?.role     || 'Inspector',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const set = (key) => (e) =>
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!editingUser) {
      if (formData.password !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }
      if (formData.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return;
      }
    }

    try {
      setLoading(true);
      if (editingUser) {
        const res = await api.put(`/users/${editingUser.id}`, {
          username: formData.username,
          email:    formData.email,
          role:     formData.role,
        });
        if (res.success) { onSaved(res.data); onClose(); }
      } else {
        const res = await api.post('/auth/register', {
          username: formData.username,
          email:    formData.email,
          password: formData.password,
          role:     formData.role,
        });
        if (res.id || res.success) { onCreated(); onClose(); }
      }
    } catch (err) {
      setError(err.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="uf-page">
      <button className="uf-back" onClick={onClose}>
        <ArrowLeft size={14} />
        Volver
      </button>

      <div className="uf-card">
        <div className="uf-card-header">
          <div className="uf-card-icon">
            {editingUser ? <Edit size={16} /> : <UsersIcon size={16} />}
          </div>
          <div>
            <h2 className="uf-card-title">
              {editingUser ? 'Editar usuario' : 'Nuevo usuario'}
            </h2>
            <p className="uf-card-subtitle">
              {editingUser
                ? 'Actualiza los datos del usuario'
                : 'Registra un nuevo usuario en el sistema'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="uf-form">
          {error && <div className="uf-alert">{error}</div>}

          <div className="uf-field">
            <label className="uf-label">Usuario *</label>
            <div className="uf-input-wrap">
              <User size={14} className="uf-input-icon" />
              <input
                type="text" className="uf-input" placeholder="Nombre de usuario"
                value={formData.username} onChange={set('username')} required
              />
            </div>
          </div>

          <div className="uf-field">
            <label className="uf-label">Email *</label>
            <div className="uf-input-wrap">
              <Mail size={14} className="uf-input-icon" />
              <input
                type="email" className="uf-input" placeholder="correo@ejemplo.com"
                value={formData.email} onChange={set('email')} required
              />
            </div>
          </div>

          {!editingUser && (
            <>
              <div className="uf-field">
                <label className="uf-label">Contraseña *</label>
                <div className="uf-input-wrap">
                  <Lock size={14} className="uf-input-icon" />
                  <input
                    type="password" className="uf-input" placeholder="Mínimo 6 caracteres"
                    value={formData.password} onChange={set('password')} required
                  />
                </div>
              </div>
              <div className="uf-field">
                <label className="uf-label">Confirmar contraseña *</label>
                <div className="uf-input-wrap">
                  <Lock size={14} className="uf-input-icon" />
                  <input
                    type="password" className="uf-input" placeholder="Repite la contraseña"
                    value={formData.confirmPassword} onChange={set('confirmPassword')} required
                  />
                </div>
              </div>
            </>
          )}

          <div className="uf-field">
            <label className="uf-label">Rol</label>
            <div className="uf-input-wrap">
              <Shield size={14} className="uf-input-icon" />
              <select className="uf-input uf-select" value={formData.role} onChange={set('role')}>
                <option value="Admin">Admin</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Inspector">Inspector</option>
                <option value="Auditor">Auditor</option>
              </select>
            </div>
          </div>

          <div className="uf-actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn--primary" disabled={loading}>
              <Save size={14} />
              {loading ? 'Guardando…' : editingUser ? 'Actualizar' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main ────────────────────────────────────────────────────────────────────

const Users = () => {
  const { isAdmin } = useAuth();
  const [users,       setUsers]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [showForm,    setShowForm]    = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm,  setSearchTerm]  = useState('');

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/users');
      if (res.success) setUsers(res.data);
      else setError('Error al cargar usuarios');
    } catch (err) {
      setError(err.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    return u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const activeCount   = users.filter((u) => u.IsActive).length;
  const inactiveCount = users.length - activeCount;
  const adminCount    = users.filter((u) => u.role === 'Admin').length;

  const openCreate = ()  => { setEditingUser(null); setShowForm(true); };
  const openEdit   = (u) => { setEditingUser(u);    setShowForm(true); };
  const closeForm  = ()  => { setShowForm(false);   setEditingUser(null); };

  const handleSaved = (updated) =>
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));

  const handleCreated = () => loadUsers();

  const handleDelete = async (id, username) => {
    if (!window.confirm(`¿Eliminar al usuario "${username}"?`)) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      alert(err.message || 'Error al eliminar');
    }
  };

  const handleToggle = async (id, isActive, username) => {
    const action = isActive ? 'desactivar' : 'activar';
    if (!window.confirm(`¿Deseas ${action} a "${username}"?`)) return;
    try {
      const endpoint = isActive ? `/users/${id}/deactivate` : `/users/${id}/activate`;
      const res = await api.post(endpoint);
      if (res.success)
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, IsActive: !isActive } : u))
        );
    } catch (err) {
      alert(err.message || `Error al ${action}`);
    }
  };

  if (loading) {
    return (
      <div className="users-loading">
        <div className="users-spinner" />
      </div>
    );
  }

  if (showForm) {
    return (
      <UserForm
        editingUser={editingUser}
        onClose={closeForm}
        onSaved={handleSaved}
        onCreated={handleCreated}
      />
    );
  }

  return (
    <div className="users-page">

      {/* Header */}
      <div className="users-header">
        <div>
          <h1 className="users-title">
            <UsersIcon size={20} className="users-title__icon" aria-hidden="true" />
            Usuarios
          </h1>
          <p className="users-subtitle">Gestiona los accesos y roles del sistema</p>
        </div>

        <div className="users-toolbar">
          <div className="search-wrap">
            <Search size={14} className="search-wrap__icon" aria-hidden="true" />
            <input
              type="text"
              placeholder="Buscar usuario…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              aria-label="Buscar usuario"
            />
          </div>
          <button onClick={loadUsers} className="btn btn--icon" title="Actualizar" aria-label="Actualizar lista">
            <RefreshCw size={14} />
          </button>
          {isAdmin && (
            <button onClick={openCreate} className="btn btn--primary">
              <Plus size={14} /> Nuevo usuario
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="users-stats">
        <div className="stat-card">
          <span className="stat-card__val">{users.length}</span>
          <span className="stat-card__lbl"><UsersIcon size={12} aria-hidden="true" /> Total usuarios</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__val stat-card__val--active">{activeCount}</span>
          <span className="stat-card__lbl stat-card__lbl--active"><UserCheck size={12} aria-hidden="true" /> Activos</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__val stat-card__val--inactive">{inactiveCount}</span>
          <span className="stat-card__lbl"><UserX size={12} aria-hidden="true" /> Inactivos</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__val stat-card__val--admin">{adminCount}</span>
          <span className="stat-card__lbl stat-card__lbl--admin"><Shield size={12} aria-hidden="true" /> Admins</span>
        </div>
      </div>

      {error && <div className="uf-alert" style={{ marginBottom: '1rem' }}>{error}</div>}

      {/* Table */}
      <div className="users-panel">
        <div className="users-table-wrap">
          <table className="users-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                {isAdmin && <th className="col-actions" />}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => {
                const cfg = getConfig(user.role);
                return (
                  <tr key={user.id} className="users-row">
                    <td>
                      <div className="user-cell">
                        <div className={`av ${cfg.avatar}`}>{getInitials(user.username)}</div>
                        <div>
                          <span className="user-name">{user.username}</span>
                          <span className="user-id">ID · {user.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="cell-email">{user.email}</td>
                    <td>
                      <span className={`rb ${cfg.badge}`}>
                        {cfg.icon}
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`sp ${user.IsActive ? 'sp--active' : 'sp--inactive'}`}>
                        <span className="sp__dot" />
                        {user.IsActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td>
                        <div className="row-actions">
                          <button
                            onClick={() => openEdit(user)}
                            className="ab"
                            title="Editar"
                            aria-label={`Editar ${user.username}`}
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            onClick={() => handleToggle(user.id, user.IsActive, user.username)}
                            className="ab ab--toggle"
                            title={user.IsActive ? 'Desactivar' : 'Activar'}
                            aria-label={`${user.IsActive ? 'Desactivar' : 'Activar'} ${user.username}`}
                          >
                            {user.IsActive ? <UserX size={13} /> : <UserCheck size={13} />}
                          </button>
                          <button
                            onClick={() => handleDelete(user.id, user.username)}
                            className="ab ab--danger"
                            title="Eliminar"
                            aria-label={`Eliminar ${user.username}`}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="users-empty">
            <UsersIcon size={28} className="users-empty__icon" aria-hidden="true" />
            <p className="users-empty__text">
              {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
            </p>
          </div>
        )}
      </div>

      <p className="users-footer">
        {filtered.length} usuario{filtered.length !== 1 ? 's' : ''}
        {searchTerm && ` de ${users.length} en total`}
        {!searchTerm && ` · ${activeCount} activo${activeCount !== 1 ? 's' : ''} · ${inactiveCount} inactivo${inactiveCount !== 1 ? 's' : ''}`}
      </p>
    </div>
  );
};

export default Users;