// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import { canAccessRoute, getCurrentUserRole, ROLES } from '../utils/roleValidator';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Lógica de sesión actualizada
  const isLoggedIn = localStorage.getItem('token'); // Verificar si hay un token almacenado
  const userRole = getCurrentUserRole();
  
  const handleLogout = () => {
    localStorage.removeItem('token'); // Limpiar el token de sesión
    localStorage.removeItem('user'); // Limpiar datos del usuario
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  // Ocultar completamente la navbar en la vista de validación QR
  if (location.pathname.startsWith('/validar') || location.pathname === '/validacion') {
    return null;
  }

  if (!isLoggedIn) {
    return null; // Ocultar la navbar si no hay sesión activa
  }

  const user = JSON.parse(localStorage.getItem('user')); // Obtener datos del usuario logueado

  return (
    <nav className="navbar navbar-expand-lg navbar-dark" style={{ background: 'linear-gradient(135deg, #0f574e, #0a3d38)', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}>
      <Link className="navbar-brand fw-bold" to="/" style={{ color: '#fff' }}>
        🧾 Entregas
      </Link>
      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNavAltMarkup"
        aria-controls="navbarNavAltMarkup"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
        <div className="navbar-nav me-auto">
          {canAccessRoute(userRole, '/') && (
            <Link className={`nav-link ${isActive('/') ? 'active' : ''}`} to="/" style={{ color: '#fff' }}>Inicio</Link>
          )}
          {canAccessRoute(userRole, '/carga') && (
            <Link className={`nav-link ${isActive('/carga') ? 'active' : ''}`} to="/carga" style={{ color: '#fff' }}>Carga</Link>
          )}
          {canAccessRoute(userRole, '/productos') && (
            <Link className={`nav-link ${isActive('/productos') ? 'active' : ''}`} to="/productos" style={{ color: '#fff' }}>Productos</Link>
          )}
          {canAccessRoute(userRole, '/remitos-pendientes') && (
            <Link className={`nav-link ${isActive('/remitos-pendientes') ? 'active' : ''}`} to="/remitos-pendientes" style={{ color: '#fff' }}>Remitos pendientes</Link>
          )}
          {canAccessRoute(userRole, '/reportes') && (
            <Link className={`nav-link ${isActive('/reportes') ? 'active' : ''}`} to="/reportes" style={{ color: '#fff' }}>Reportes</Link>
          )}
          {canAccessRoute(userRole, '/alta-usuario') && (
            <Link className={`nav-link ${isActive('/alta-usuario') ? 'active' : ''}`} to="/alta-usuario" style={{ color: '#fff' }}>Usuarios</Link>
          )}
        </div>
        {isLoggedIn && (
          <div className="navbar-text text-light me-3 d-flex align-items-center">
            <FaUser className="me-2" />
            {user?.nombre || 'Usuario'}
          </div>
        )}
        {isLoggedIn && (
          <button className="btn btn-outline-light btn-sm me-3" onClick={handleLogout} style={{ 
            borderRadius: '5px', 
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
            marginRight: 'var(--spacing-lg)'
          }}>
            <i className="fas fa-sign-out-alt me-1"></i> Cerrar sesión
          </button>
        )}
      </div>
    </nav>
  );
}
