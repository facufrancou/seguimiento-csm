import React, { useState } from 'react';
import { Form, Button, Card, Alert, Container } from 'react-bootstrap';
import { registrarUsuario } from '../services/api';

export default function AltaUsuario() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('operario');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    <Container fluid className="py-4 px-2 w-100">
      <Card>
        <Card.Body>
          <h4 className="mb-3">Alta de Usuario / Operario</h4>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control value={nombre} onChange={e => setNombre(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Rol</Form.Label>
              <Form.Select value={rol} onChange={e => setRol(e.target.value)}>
                <option value="operario">Operario</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
            {msg && <Alert variant="success">{msg}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}
            <Button type="submit" variant="primary" disabled={loading} className="w-100">
              {loading ? 'Creando...' : 'Crear usuario'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
