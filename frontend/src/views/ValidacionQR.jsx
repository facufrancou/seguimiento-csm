import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { validarQR, registrarEntrega } from '../services/api';

export default function ValidacionQR() {
  const { token } = useParams();
  const [remito, setRemito] = useState(null);
  const [productos, setProductos] = useState([]);
  const [operarios, setOperarios] = useState([]);
  const [operarioId, setOperarioId] = useState('');
  const [entregados, setEntregados] = useState([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [registrando, setRegistrando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchRemito() {
      setLoading(true);
      try {
        const data = await validarQR(token);
        setRemito(data);
        setProductos(data.productos || []);
        // Obtener operarios asignados a este remito
        const res = await fetch(`/api/remitos/${data.id}/operarios`);
        const ops = await res.json();
        setOperarios(ops);
      } catch (err) {
        console.error('Error al validar QR:', err);
        setError('Token inválido, expirado o remito no encontrado.');
      } finally {
        setLoading(false);
      }
    }
    fetchRemito();
  }, [token]);

  const handleCheck = (id) => {
    setEntregados((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleRegistrar = async (e) => {
    e.preventDefault();
    setMsg('');
    if (!operarioId) {
      setMsg('Seleccioná el operario que entrega.');
      return;
    }
    if (entregados.length === 0) {
      setMsg('Seleccioná al menos un producto.');
      return;
    }
    setRegistrando(true);
    try {
      // Buscar el nombre del operario seleccionado
      const operario = operarios.find(op => String(op.id) === String(operarioId));
      const res = await registrarEntrega({
        token,
        operario_id: operarioId,
        nombre_operario: operario ? operario.nombre : '',
        productos: entregados
      });
      setMsg(res.mensaje || 'Entrega registrada correctamente.');
    } catch (err) {
      setMsg('Error al registrar la entrega.');
    } finally {
      setRegistrando(false);
    }
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger" className="mt-4">{error}</Alert>;
  if (!remito) return null;

  // Si la entrega fue registrada correctamente, mostrar solo el mensaje
  if (msg && msg.toLowerCase().includes('registrada')) {
    return (
      <Container fluid className="py-4 px-2 w-100">
        <Alert variant="success" className="mt-4">{msg}</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4 px-2 w-100">
      <Card>
        <Card.Body>
          <h4 className="mb-3">Entrega de Remito</h4>
          <div className="mb-2"><b>N° Remito:</b> {remito.numero_remito}</div>
          <div className="mb-2"><b>Cliente:</b> {remito.cliente_nombre}</div>
          <div className="mb-2"><b>Fecha:</b> {remito.fecha_emision}</div>
          <Form onSubmit={handleRegistrar}>
            <Form.Group className="mb-3">
              <Form.Label>Operario que entrega</Form.Label>
              <Form.Select value={operarioId} onChange={e => setOperarioId(e.target.value)} required>
                <option value="">Seleccioná operario</option>
                {operarios.map(op => (
                  <option key={op.id} value={op.id}>{op.nombre}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Productos entregados</Form.Label>
              <div>
                {productos.length === 0 && <div className="text-muted">No hay productos para entregar.</div>}
                {productos.map(p => (
                  <Form.Check
                    key={p.producto_id || p.id}
                    type="checkbox"
                    label={`${p.nombre} (${p.cantidad})`}
                    checked={entregados.includes(p.producto_id || p.id)}
                    onChange={() => handleCheck(p.producto_id || p.id)}
                  />
                ))}
              </div>
            </Form.Group>
            {msg && <Alert variant={msg.includes('Error') ? 'danger' : 'success'}>{msg}</Alert>}
            <Button type="submit" variant="success" disabled={registrando} className="w-100">
              {registrando ? 'Registrando...' : 'Registrar'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
