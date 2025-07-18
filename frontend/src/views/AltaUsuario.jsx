import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { registrarUsuario } from '../services/api';
import { hasPermission } from '../utils/roleValidator';

export default function AltaUsuario() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('operario');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const allowedRoles = ['admin'];
  const user = JSON.parse(localStorage.getItem('user'));

  if (!hasPermission(user?.rol, allowedRoles)) {
    return <Alert variant="danger">No tienes permiso para acceder a esta página.</Alert>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(''); setError('');
    if (!nombre || !email || !password) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    setLoading(true);
    try {
      await registrarUsuario({ nombre, email, password, rol });
      setMsg('Usuario creado correctamente.');
      setNombre(''); setEmail(''); setPassword(''); setRol('operario');
    } catch (err) {
      setError('Error al crear usuario.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="productos-view">
      <div className="container">
        <h1 className="productos-title">Gestión de Usuarios</h1>
        <div className="card">
          <div className="card-body">
            <Form onSubmit={handleSubmit}>
              <Form.Group className="form-group">
                <Form.Label className="form-label">
                  <i className="fas fa-user"></i> Nombre
                </Form.Label>
                <Form.Control 
                  className="form-control"
                  value={nombre} 
                  onChange={e => setNombre(e.target.value)} 
                  required 
                />
              </Form.Group>
              
              <Form.Group className="form-group">
                <Form.Label className="form-label">
                  <i className="fas fa-envelope"></i> Email
                </Form.Label>
                <Form.Control 
                  type="email" 
                  className="form-control"
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                />
              </Form.Group>
              
              <Form.Group className="form-group">
                <Form.Label className="form-label">
                  <i className="fas fa-lock"></i> Contraseña
                </Form.Label>
                <Form.Control 
                  type="password" 
                  className="form-control"
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                />
              </Form.Group>
              
              <Form.Group className="form-group">
                <Form.Label className="form-label">
                  <i className="fas fa-user-tag"></i> Rol
                </Form.Label>
                <Form.Select 
                  className="form-control"
                  value={rol} 
                  onChange={e => setRol(e.target.value)}
                >
                  <option value="operario">Operario</option>
                  <option value="admin">Admin</option>
                </Form.Select>
              </Form.Group>
              
              {msg && <Alert variant="success" className="alert alert-success">{msg}</Alert>}
              {error && <Alert variant="danger" className="alert alert-danger">{error}</Alert>}
              
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Creando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-user-plus"></i> Crear usuario
                  </>
                )}
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
