// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Lógica de sesión actualizada
  const isLoggedIn = localStorage.getItem('token'); // Verificar si hay un token almacenado
  const handleLogout = () => {
    localStorage.removeItem('token'); // Limpiar el token de sesión
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
          <Link className={`nav-link ${isActive('/') ? 'active' : ''}`} to="/" style={{ color: '#fff' }}>Inicio</Link>
          <Link className={`nav-link ${isActive('/carga') ? 'active' : ''}`} to="/carga" style={{ color: '#fff' }}>Carga</Link>
          <Link className={`nav-link ${isActive('/reportes') ? 'active' : ''}`} to="/reportes" style={{ color: '#fff' }}>Reportes</Link>
          <Link className={`nav-link ${isActive('/alta-usuario') ? 'active' : ''}`} to="/alta-usuario" style={{ color: '#fff' }}>Usuarios</Link>
          <Link className={`nav-link ${isActive('/remitos-pendientes') ? 'active' : ''}`} to="/remitos-pendientes" style={{ color: '#fff' }}>Remitos pendientes</Link>
        </div>
        {isLoggedIn && (
          <div className="navbar-text text-light me-3 d-flex align-items-center">
            <FaUser className="me-2" />
            {user?.nombre || 'Usuario'}
          </div>
        )}
        {isLoggedIn && (
          <button className="btn btn-outline-light btn-sm" onClick={handleLogout} style={{ borderRadius: '5px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}>
            Cerrar sesión
          </button>
        )}
      </div>
    </nav>
  );
}
