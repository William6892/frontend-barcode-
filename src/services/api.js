// services/api.js
const BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7131/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// ⭐ Función para manejar errores de autenticación
const handleUnauthorized = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export const api = {
  get: async (endpoint) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, { headers: getHeaders() });
    
    if (res.status === 401) {
      handleUnauthorized();
      throw new Error('Sesión expirada');
    }
    
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  
  post: async (endpoint, data) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    
    if (res.status === 401) {
      handleUnauthorized();
      throw new Error('Sesión expirada');
    }
    
    const text = await res.text();
    if (!res.ok) throw new Error(text);
    return text ? JSON.parse(text) : {};
  },
  
  put: async (endpoint, data) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    
    if (res.status === 401) {
      handleUnauthorized();
      throw new Error('Sesión expirada');
    }
    
    const text = await res.text();
    if (!res.ok) throw new Error(text);
    return text ? JSON.parse(text) : {};
  },
  
  delete: async (endpoint) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    
    if (res.status === 401) {
      handleUnauthorized();
      throw new Error('Sesión expirada');
    }
    
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
};