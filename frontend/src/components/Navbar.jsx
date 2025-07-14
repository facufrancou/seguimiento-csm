// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Simulación de sesión activa (más adelante se puede mejorar)
  const isLoggedIn = true; // Reemplazaremos con lógica real
  const handleLogout = () => {
    // Aquí podés limpiar sesión o tokens si usás uno
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  // Ocultar completamente la navbar en la vista de validación QR
  if (location.pathname.startsWith('/validar') || location.pathname === '/validacion') {
    return null;
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      <Link className="navbar-brand fw-bold" to="/">
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
          <Link className={`nav-link ${isActive('/') ? 'active' : ''}`} to="/">Inicio</Link>
          <Link className={`nav-link ${isActive('/carga') ? 'active' : ''}`} to="/carga">Carga</Link>
          <Link className={`nav-link ${isActive('/reportes') ? 'active' : ''}`} to="/reportes">Reportes</Link>
          <Link className={`nav-link ${isActive('/alta-usuario') ? 'active' : ''}`} to="/alta-usuario">Usuarios</Link>
          <Link className={`nav-link ${isActive('/remitos-pendientes') ? 'active' : ''}`} to="/remitos-pendientes">Remitos pendientes</Link>
        </div>
        {isLoggedIn && (
          <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
            Cerrar sesión
          </button>
        )}
      </div>
    </nav>
  );
}
