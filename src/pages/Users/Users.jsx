// pages/Users/Users.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  Edit, Trash2, UserCheck, UserX, Plus, RefreshCw,
  ArrowLeft, Save, User, Mail, Lock, Shield, Search,
  Users as UsersIcon
} from 'lucide-react';

const getRoleBadge = (role) => {
  const styles = {
    Admin:      'bg-blue-50 text-blue-700',
    Supervisor: 'bg-purple-50 text-purple-700',
    Inspector:  'bg-green-50 text-green-700',
    Auditor:    'bg-amber-50 text-amber-700',
  };
  return styles[role] || 'bg-gray-100 text-gray-600';
};

const getAvatarColors = (role) => {
  const styles = {
    Admin:      'bg-blue-50 text-blue-700',
    Supervisor: 'bg-purple-50 text-purple-700',
    Inspector:  'bg-green-50 text-green-700',
    Auditor:    'bg-amber-50 text-amber-700',
  };
  return styles[role] || 'bg-gray-100 text-gray-600';
};

const getInitials = (name) => name.charAt(0).toUpperCase();

// ─── Form ────────────────────────────────────────────────────────────────────

const UserForm = ({ editingUser, onClose, onSaved, onCreated }) => {
  const [formData, setFormData] = useState({
    username:        editingUser?.username        || '',
    email:           editingUser?.email           || '',
    password:        '',
    confirmPassword: '',
    role:            editingUser?.role            || 'Inspector',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const set = (key) => (e) => setFormData((prev) => ({ ...prev, [key]: e.target.value }));

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

  const inputClass =
    'input-field w-full';

  return (
    <div className="p-6 max-w-lg mx-auto">
      <button
        onClick={onClose}
        className="flex items-center gap-1.5 text-sm text-muted hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Volver
      </button>

      <div className="glass-panel p-7">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            {editingUser ? <Edit size={18} className="text-primary" /> : <UsersIcon size={18} className="text-primary" />}
          </div>
          <div>
            <h1 className="text-lg font-semibold">
              {editingUser ? 'Editar usuario' : 'Nuevo usuario'}
            </h1>
            <p className="text-xs text-muted">
              {editingUser ? 'Actualiza los datos del usuario' : 'Registra un nuevo usuario en el sistema'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-100 text-danger text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Usuario *</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text" className={inputClass} placeholder="Nombre de usuario"
                value={formData.username} onChange={set('username')} required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Email *</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="email" className={inputClass} placeholder="correo@ejemplo.com"
                value={formData.email} onChange={set('email')} required
              />
            </div>
          </div>

          {!editingUser && (
            <>
              <div className="input-group">
                <label className="input-label">Contraseña *</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="password" className={inputClass} placeholder="Mínimo 6 caracteres"
                    value={formData.password} onChange={set('password')} required
                  />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Confirmar contraseña *</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="password" className={inputClass} placeholder="Repite la contraseña"
                    value={formData.confirmPassword} onChange={set('confirmPassword')} required
                  />
                </div>
              </div>
            </>
          )}

          <div className="input-group">
            <label className="input-label">Rol</label>
            <div className="relative">
              <Shield size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <select
                className={inputClass + ' appearance-none cursor-pointer'}
                value={formData.role} onChange={set('role')}
              >
                <option value="Admin">Admin</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Inspector">Inspector</option>
                <option value="Auditor">Auditor</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button" onClick={onClose}
              className="btn btn-glass flex-1"
            >
              Cancelar
            </button>
            <button
              type="submit" disabled={loading}
              className="btn btn-primary flex-1"
            >
              <Save size={16} />
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
      console.log('Respuesta:', res);
      if (res.success) {
        setUsers(res.data);
      } else {
        setError('Error al cargar usuarios');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreate = () => { setEditingUser(null); setShowForm(true); };
  const openEdit   = (u)  => { setEditingUser(u);   setShowForm(true); };
  const closeForm  = ()   => { setShowForm(false);  setEditingUser(null); };

  const handleSaved = (updated) =>
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));

  const handleCreated = () => loadUsers();

  const handleDelete = async (id, username) => {
    if (!window.confirm(`¿Eliminar al usuario "${username}"?`)) return;
    try {
      const res = await api.delete(`/users/${id}`);
      if (res.success || res.message || res === '' || res?.status === 204) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } else {
        setUsers((prev) => prev.filter((u) => u.id !== id));
      }
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
      if (res.success) {
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, IsActive: !isActive } : u)));
      }
    } catch (err) {
      alert(err.message || `Error al ${action}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-primary" />
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
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <UsersIcon size={22} className="text-muted" />
            Usuarios
          </h1>
          <p className="text-sm text-muted mt-0.5">Gestiona los usuarios del sistema</p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Buscar usuario…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field w-full sm:w-52 pl-9"
            />
          </div>

          <button
            onClick={loadUsers}
            className="btn btn-glass"
            title="Actualizar"
          >
            <RefreshCw size={16} />
          </button>

          {isAdmin && (
            <button
              onClick={openCreate}
              className="btn btn-primary"
            >
              <Plus size={16} /> Nuevo
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-danger text-sm px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-glass">
                {['Usuario', 'Email', 'Rol', 'Estado', ''].map((h, i) => (
                  <th
                    key={i}
                    className={`px-5 py-3.5 text-xs font-medium text-muted uppercase tracking-wider ${i === 4 ? 'text-right' : 'text-left'}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-glass">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-surface-hover transition-colors">

                  {/* Usuario */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold flex-shrink-0 ${getAvatarColors(user.role)}`}>
                        {getInitials(user.username)}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{user.username}</div>
                        <div className="text-xs text-muted">ID: {user.id}</div>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-5 py-3.5 text-sm text-secondary">{user.email}</td>

                  {/* Rol */}
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg ${getRoleBadge(user.role)}`}>
                      {user.role}
                    </span>
                  </td>

                  {/* Estado */}
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${user.IsActive ? 'text-success' : 'text-danger'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.IsActive ? 'bg-success' : 'bg-danger'}`} />
                      {user.IsActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td className="px-5 py-3.5">
                    {isAdmin && (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(user)}
                          className="p-1.5 text-muted hover:text-primary hover:bg-primary-glow rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleToggle(user.id, user.IsActive, user.username)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            user.IsActive
                              ? 'text-muted hover:text-warning hover:bg-warning-bg'
                              : 'text-muted hover:text-success hover:bg-success-bg'
                          }`}
                          title={user.IsActive ? 'Desactivar' : 'Activar'}
                        >
                          {user.IsActive ? <UserX size={15} /> : <UserCheck size={15} />}
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.username)}
                          className="p-1.5 text-muted hover:text-danger hover:bg-danger-bg rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-14">
            <UsersIcon size={32} className="mx-auto text-muted mb-3" />
            <p className="text-sm text-muted">
              {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
            </p>
          </div>
        )}
      </div>

      <div className="mt-3 text-xs text-muted">
        {filtered.length} usuario{filtered.length !== 1 ? 's' : ''}
        {searchTerm && ` de ${users.length} en total`}
      </div>
    </div>
  );
};

export default Users;