import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Container, Card, Button, Alert, Spinner, Modal } from 'react-bootstrap';
import { validarQR, registrarEntrega } from '../services/api';
import { FaTrashAlt, FaBarcode } from 'react-icons/fa';

export default function ValidacionQR() {
  const { token: paramToken } = useParams();
  const location = useLocation();
  const queryToken = new URLSearchParams(location.search).get('token');
  const token = paramToken || queryToken;

  const [remito, setRemito] = useState(null);
  const [productos, setProductos] = useState([]);
  const [operarios, setOperarios] = useState([]);
  const [operarioId, setOperarioId] = useState('');
  const [productosEscaneados, setProductosEscaneados] = useState([]);
  const [escaneando, setEscaneando] = useState(false);
  const [codigoBarra, setCodigoBarra] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    async function fetchRemito() {
      try {
        const data = await validarQR(token);
        setRemito(data);
        setProductos(data.productos || []);
        const res = await fetch(`/api/remitos/${data.id}/operarios`);
        const ops = await res.json();
        setOperarios(Array.isArray(ops) ? ops : ops.todos || []);
      } catch (err) {
        console.error('Error al validar QR:', err);
      }
    }
    fetchRemito();
  }, [token]);

  const iniciarEscaneo = () => {
    setEscaneando(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const manejarCodigoBarra = (codigo) => {
    const producto = productos.find((p) => p.codigo_barra === codigo);
    if (producto) {
      setProductosEscaneados((prev) => [...prev, { ...producto, cantidad: 1 }]);
      setCodigoBarra('');
    }
  };

  const validarCantidades = () => {
    const totalEscaneados = productosEscaneados.reduce((acc, p) => {
      acc[p.id] = (acc[p.id] || 0) + p.cantidad;
      return acc;
    }, {});

    const diferencias = productos.map((producto) => {
      const cantidadEscaneada = totalEscaneados[producto.id] || 0;
      const cantidadSolicitada = parseFloat(producto.cantidad);
      return {
        nombre: producto.nombre,
        cantidadSolicitada,
        cantidadEscaneada,
      };
    });

    const productosConProblemas = diferencias.filter(
      (d) => d.cantidadEscaneada !== d.cantidadSolicitada
    );

    if (productosConProblemas.length > 0) {
      const mensaje = productosConProblemas.map(
        (p) => `<li>${p.nombre}: Solicitado ${p.cantidadSolicitada}, Escaneado ${p.cantidadEscaneada}</li>`
      ).join('');

      setModalMessage(`Las cantidades no coinciden:<ul>${mensaje}</ul>`);
      setShowModal(true);
      return false;
    }

    return true;
  };

  const finalizarEntrega = async () => {
    try {
      if (!validarCantidades()) {
        return;
      }

      const operario = operarios.find(op => String(op.id) === String(operarioId));
      if (!operario) {
        setModalMessage('Operario no válido.');
        setShowModal(true);
        return;
      }

      const productosFormatted = productosEscaneados.map((p) => ({
        producto_id: p.id,
        cantidad: p.cantidad,
      }));

      await registrarEntrega({
        token,
        operario_id: operarioId,
        nombre_operario: operario.nombre,
        productos: productosFormatted,
      });

      setModalMessage('Entrega registrada exitosamente.');
      setShowModal(true);
      setProductosEscaneados([]);
      setOperarioId('');
      setEscaneando(false);
      setRemito(null); // Eliminar datos del remito
    } catch (error) {
      setModalMessage('Error al registrar la entrega.');
      setShowModal(true);
    }
  };

  if (!remito) {
    return (
      <Container fluid className="py-4 px-2 w-100">
        <Alert variant="success" className="mt-4">Entrega registrada correctamente.</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Card>
        <Card.Body>
          <h4 style={{ fontWeight: 'bold', color: '#343a40' }}>Entrega de Remito</h4>
          <p><strong style={{ color: '#6c757d' }}>N° Remito:</strong> {remito.numero_remito}</p>
          <p><strong style={{ color: '#6c757d' }}>Cliente:</strong> {remito.cliente_nombre}</p>
          <p><strong style={{ color: '#6c757d' }}>Fecha:</strong> {new Date(remito.fecha_emision).toLocaleDateString()}</p>
          <p><strong style={{ color: '#6c757d' }}>Productos a entregar:</strong></p>
          <ul style={{ paddingLeft: '20px', listStyleType: 'circle' }}>
            {productos.map((p) => (
              <li key={p.id} style={{ color: '#495057', fontWeight: '500' }}>{p.nombre} - {p.cantidad}</li>
            ))}
          </ul>
          <div className="mb-3">
            <label style={{ fontWeight: 'bold', color: '#343a40' }}>Operario que entrega</label>
            <select
              className="form-control"
              value={operarioId}
              onChange={(e) => setOperarioId(e.target.value)}
              style={{ borderColor: '#6c757d', borderRadius: '5px' }}
            >
              <option value="">Seleccionar operario</option>
              {operarios.map((op) => (
                <option key={op.id} value={op.id}>{op.nombre}</option>
              ))}
            </select>
          </div>
          <Button
            onClick={iniciarEscaneo}
            style={{ backgroundColor: '#007bff', borderColor: '#007bff', fontWeight: 'bold' }}
          >
            Escanear productos
          </Button>
        </Card.Body>
      </Card>

      {escaneando && (
        <Card className="mt-3">
          <Card.Body>
            <h5>Escaneo de productos</h5>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-control mb-3"
                placeholder="Ingresar código de barra"
                value={codigoBarra}
                onChange={(e) => {
                  const nuevoCodigo = e.target.value;
                  setCodigoBarra(nuevoCodigo);
                  manejarCodigoBarra(nuevoCodigo);
                }}
                ref={inputRef}
                style={{ paddingLeft: '2.5rem' }}
              />
              <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                <FaBarcode size={20} color="#6c757d" />
              </div>
            </div>
            <ul className="mt-3 list-group">
              {productosEscaneados.map((p, index) => (
                <li
                  key={index}
                  className="list-group-item d-flex justify-content-between align-items-center"
                  style={{ border: '1px solid #dee2e6', borderRadius: '5px', marginBottom: '5px' }}
                >
                  <span style={{ fontWeight: 'bold', color: '#495057' }}>{p.nombre} - {p.cantidad}</span>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setProductosEscaneados((prev) => {
                        const indexToRemove = prev.findIndex((prod, i) => i === index);
                        if (indexToRemove !== -1) {
                          const updatedList = [...prev];
                          updatedList.splice(indexToRemove, 1);
                          return updatedList;
                        }
                        return prev;
                      });
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                  >
                    <FaTrashAlt size={16} /> Eliminar
                  </Button>
                </li>
              ))}
            </ul>
            {productosEscaneados.length > 0 && (
              <Button className="mt-3" onClick={finalizarEntrega}>Finalizar entrega</Button>
            )}
          </Card.Body>
        </Card>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontWeight: 'bold', color: '#dc3545' }}>Aviso</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ fontSize: '16px', lineHeight: '1.5', color: '#333' }} dangerouslySetInnerHTML={{ __html: modalMessage }} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)} style={{ backgroundColor: '#6c757d', borderColor: '#6c757d' }}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
