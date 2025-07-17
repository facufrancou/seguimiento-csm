import React, { useState } from 'react';
import { Form, Button, Card, Alert, Container } from 'react-bootstrap';
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
    <Container fluid className="py-4 px-2 w-100" style={{ backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}>
      <Card>
        <Card.Body>
          <h4 className="mb-3" style={{ fontWeight: 'bold', color: '#0a3d38' }}>Alta de Usuario / Operario</h4>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: 'bold', color: '#0a3d38' }}>Nombre</Form.Label>
              <Form.Control value={nombre} onChange={e => setNombre(e.target.value)} required style={{ borderRadius: '5px', borderColor: '#0f574e' }} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: 'bold', color: '#0a3d38' }}>Email</Form.Label>
              <Form.Control type="text" value={email} onChange={e => setEmail(e.target.value)} required style={{ borderRadius: '5px', borderColor: '#0f574e' }} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: 'bold', color: '#0a3d38' }}>Contraseña</Form.Label>
              <Form.Control type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ borderRadius: '5px', borderColor: '#0f574e' }} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: 'bold', color: '#0a3d38' }}>Rol</Form.Label>
              <Form.Select value={rol} onChange={e => setRol(e.target.value)} style={{ borderRadius: '5px', borderColor: '#0f574e' }}>
                <option value="operario">Operario</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
            {msg && <Alert variant="success" style={{ borderRadius: '5px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}>{msg}</Alert>}
            {error && <Alert variant="danger" style={{ borderRadius: '5px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}>{error}</Alert>}
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-100"
              style={{
                fontWeight: 'bold',
                borderRadius: '5px',
                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                background: 'linear-gradient(90deg, #0f574e, #0a3d38)',
                color: '#fff'
              }}
            >
              {loading ? 'Creando...' : 'Crear usuario'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
