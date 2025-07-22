// src/services/api.js
import axios from 'axios';

// ⚙️ URL base del backend (cambiá esto según el entorno)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// 🛠️ Axios instance con configuración global
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // útil si usás sesiones/cookies
});

// Interceptor para agregar token de autorización a todas las solicitudes
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// 📦 ENDPOINTS: Ejemplos básicos

// Login de usuario
export const login = async (usuario, password) => {
  const response = await api.post('/api/auth/login', { email: usuario, contraseña: password });
  return response.data;
};

// Obtener productos
export const getProductos = async () => {
  const response = await api.get('/api/productos');
  return response.data;
};

// Crear remito
export const crearRemito = async (datos) => {
  const response = await api.post('/api/remitos', datos);
  // Ahora devuelve: { id, token, urlQR }
  return response.data;
};

// Validar QR de remito
export const validarQR = async (token) => {
  const response = await api.get(`/api/remitos/validar/${token}`);
  return response.data;
};

// Confirmar entrega
export const confirmarEntrega = async (id_remito, productosConfirmados) => {
  const response = await api.post(`/api/entregas`, {
    id_remito,
    productos: productosConfirmados
  });
  return response.data;
};

// Obtener reportes
export const getReporteEntregas = async () => {
  const response = await api.get('/api/entregas/reporte');
  return response.data;
};

// Obtener clientes
export const getClientes = async () => {
  const response = await api.get('/api/clientes');
  return response.data;
};

// Parsear PDF de remito
export const parseRemitoPDF = async (formData) => {
  const response = await api.post('/api/remitos/parse-pdf', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

// Crear cliente
export const crearCliente = async (cliente) => {
  const response = await api.post('/api/clientes', cliente);
  return response.data;
};

// Crear producto
export const crearProducto = async (producto) => {
  const response = await api.post('/api/productos', producto);
  return response.data;
};

// Registrar entrega
export const registrarEntrega = async ({ token, operario_id, nombre_operario, productos, entrega_parcial = false }) => {
  const response = await api.post('/api/remitos/registrar-entrega', {
    token,
    operario_id,
    nombre_operario,
    productos,
    entrega_parcial
  });
  return response.data;
};

// Registrar usuario
export const registrarUsuario = async ({ nombre, email, password, rol }) => {
  const response = await api.post('/api/auth/registrar', { nombre, email, password, rol });
  return response.data;
};

// Obtener operarios
export const getOperarios = async () => {
  const response = await api.get('/api/auth?rol=operario');
  return response.data;
};

// Obtener remitos pendientes
export const getRemitosPendientes = async () => {
  const response = await api.get('/api/remitos?estado=pendiente');
  return response.data;
};

// Obtener detalle de productos de un remito
export const getDetalleRemito = async (remitoId) => {
  const response = await api.get(`/api/entregas/${remitoId}/detalle`);
  return response.data;
};

// Actualizar producto
export const updateProducto = async (id, data) => {
  const response = await api.put(`/api/productos/${id}`, data);
  return response.data;
};

export default api;
