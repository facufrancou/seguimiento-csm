// src/components/LoginForm.jsx
import React, { useState } from 'react';
import { login } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function LoginForm() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
      navigate('/');
    } catch (err) {
      setError('Credenciales incorrectas o error de conexión.');
    }
  };

  return (
    <div className="container-fluid mt-5 px-2 w-100" style={{ backgroundColor: '#f8f9fa', borderRadius: '10px', padding: '20px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}>
      <h3 className="mb-4" style={{ fontWeight: 'bold', color: '#343a40', textAlign: 'center' }}>Iniciar sesión</h3>
      {error && <div className="alert alert-danger" style={{ borderRadius: '5px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}>{error}</div>}
      <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto' }}>
        <div className="mb-3">
          <label className="form-label" style={{ fontWeight: 'bold', color: '#343a40' }}>Usuario</label>
          <input
            type="text"
            className="form-control"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
            style={{ borderRadius: '5px', borderColor: '#6c757d' }}
          />
        </div>
        <div className="mb-3">
          <label className="form-label" style={{ fontWeight: 'bold', color: '#343a40' }}>Contraseña</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ borderRadius: '5px', borderColor: '#6c757d' }}
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary w-100"
          style={{ fontWeight: 'bold', borderRadius: '5px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', background: 'linear-gradient(90deg, #007bff, #0056b3)' }}
        >
          Ingresar
        </button>
      </form>
    </div>
  );
}
