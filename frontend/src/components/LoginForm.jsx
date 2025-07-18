// src/components/LoginForm.jsx
import React, { useState, useEffect } from 'react';
import { login } from '../services/api';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css'; // Importamos el archivo de estilos que crearemos

export default function LoginForm() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true); // Estado para la animación de carga inicial
  const [loginSuccess, setLoginSuccess] = useState(false); // Estado para la animación de éxito
  const [animationPhase, setAnimationPhase] = useState(''); // Para controlar las fases de la animación
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
      const response = await login(usuario, password);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.usuario));
      
      // Iniciamos la secuencia de animación
      setLoginSuccess(true);
      setAnimationPhase('shrink');
      
      // Después de la animación de reducción, pasamos a la fase de celebración
      setTimeout(() => {
        setAnimationPhase('celebrate');
        
        // Finalmente, redirigimos al usuario
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }, 1000);
      
    } catch (err) {
      setError('Credenciales incorrectas o error de conexión.');
    }
  };

  if (loading) {
    return (
      <div className="login-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p className="loading-text">Cargando aplicación</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className={`login-card ${loginSuccess ? animationPhase : ''}`}>
        {/* Animación de celebración */}
        {loginSuccess && animationPhase === 'celebrate' && (
          <div className="celebration">
            <div className="checkmark-container">
              <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
              <p className="success-message">Inicio exitoso</p>
            </div>
          </div>
        )}
        
        {/* Contenido del formulario */}
        <div className="card-body">
          <h3 className="login-title">
            <i className="fas fa-user-circle"></i>
            Iniciar Sesión
          </h3>
          <div className="login-subtitle">
            <p>Seguimiento de Entregas - Coop. Gral. San Martín</p>
          </div>
          
          {error && (
            <div className="login-alert">
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className={loginSuccess ? 'form-disable' : ''}>
            <div className="form-group">
              <label className="form-label">
                <i className="fas fa-user"></i> Usuario
              </label>
              <input
                type="text"
                className="form-control"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required
                disabled={loginSuccess}
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                <i className="fas fa-lock"></i> Contraseña
              </label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loginSuccess}
              />
            </div>
            <button
              type="submit"
              className="login-button"
              disabled={loginSuccess}
            >
              {loginSuccess ? (
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
              ) : (
                <><i className="fas fa-sign-in-alt"></i> Ingresar</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
