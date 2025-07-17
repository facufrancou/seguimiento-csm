// src/components/LoginForm.jsx
import React, { useState, useEffect } from 'react';
import { login } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function LoginForm() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true); // Estado para la animación de carga
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000); // Mostrar animación por 2 segundos
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validación básica de usuario
    if (!usuario.trim()) {
      setError('Por favor, ingrese un usuario válido.');
      return;
    }

    try {
      const response = await login(usuario, password); // Cambiar email por usuario
      localStorage.setItem('token', response.token); // Guardar el token en localStorage
      localStorage.setItem('user', JSON.stringify(response.usuario)); // Guardar datos del usuario
      setLoading(true); // Mostrar animación de carga
      setTimeout(() => navigate('/'), 1500); // Pausa de 1.5 segundos antes de redirigir
    } catch (err) {
      setError('Credenciales incorrectas o error de conexión.');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ background: 'linear-gradient(135deg, #0f574e, #0a3d38)', position: 'absolute', top: '0', left: '0', width: '100%', height: '100%' }}>
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ background: 'linear-gradient(135deg, #0f574e, #0a3d38)', position: 'absolute', top: '0', left: '0', width: '100%', height: '100%' }}>
      <div className="card shadow-lg" style={{ width: '400px', borderRadius: '15px', overflow: 'hidden' }}>
        <div className="card-body p-4">
          <h3 className="mb-4 text-center" style={{ fontWeight: 'bold', color: '#0a3d38' }}>Iniciar Sesión</h3>
          <div className="text-center mt-3" style={{ fontSize: '14px', color: '#6c757d' }}>
            <p>Seguimiento de Entregas - Coop. Gral. San Martín</p>
          </div>
          {error && (
            <div className="alert alert-danger" style={{ borderRadius: '5px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}>
              {error}
            </div>
            
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: 'bold', color: '#0a3d38' }}>Usuario</label>
              <input
                type="text"
                className="form-control"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required
                style={{ borderRadius: '5px', borderColor: '#0f574e' }}
              />
            </div>
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: 'bold', color: '#0a3d38' }}>Contraseña</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ borderRadius: '5px', borderColor: '#0f574e' }}
              />
            </div>
            <button
              type="submit"
              className="btn btn-success w-100"
              style={{
                fontWeight: 'bold',
                borderRadius: '5px',
                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                background: 'linear-gradient(90deg, #0f574e, #0a3d38)',
                color: '#fff'
              }}
            >
              Ingresar
            </button>
          </form>
          
        </div>
      </div>
    </div>
  );
}
