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

// Convierte la respuesta de error del backend ({ error }, ProblemDetails o texto) en un mensaje legible
export const parseError = async (res) => {
  if (res.status === 429) return 'Demasiados intentos. Espera un minuto e intenta de nuevo.';
  if (res.status === 403) return 'No tienes permisos para esta acción.';

  const text = await res.text();
  try {
    const body = JSON.parse(text);
    if (body.error) return body.error;
    if (body.errors) return Object.values(body.errors).flat().join(' ');
    if (body.title) return body.title;
  } catch {
    // no era JSON
  }
  return text || `Error ${res.status}`;
};

const request = async (method, endpoint, data) => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: getHeaders(),
    ...(data !== undefined ? { body: JSON.stringify(data) } : {})
  });

  if (res.status === 401) {
    handleUnauthorized();
    throw new Error('Sesión expirada');
  }

  if (!res.ok) throw new Error(await parseError(res));

  const text = await res.text();
  return text ? JSON.parse(text) : {};
};

export const api = {
  get: (endpoint) => request('GET', endpoint),
  post: (endpoint, data) => request('POST', endpoint, data ?? {}),
  put: (endpoint, data) => request('PUT', endpoint, data ?? {}),
  delete: (endpoint) => request('DELETE', endpoint)
};
