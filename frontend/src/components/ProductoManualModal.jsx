import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

export default function ProductoManualModal({ show, onConfirm, onCancel }) {
  const [nombre, setNombre] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [unidad_medida, setUnidadMedida] = useState('');
  const [codigo_bit, setCodigoBit] = useState('');

  const handleGuardar = () => {
    if (!nombre || !cantidad) return;
    // Permitir coma o punto, y convertir a punto para el backend
    const cantidadNum = cantidad.replace(',', '.');
    onConfirm({
      nombre,
      cantidad: cantidadNum,
      unidad_medida,
      codigo_bit: codigo_bit === '' ? 0 : codigo_bit
    });
    setNombre('');
    setCantidad('');
    setUnidadMedida('');
    setCodigoBit('');
  };

  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>Agregar producto manualmente</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control type="text" value={nombre} onChange={e => setNombre(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Cantidad</Form.Label>
            <Form.Control type="text" value={cantidad} onChange={e => setCantidad(e.target.value.replace(/[^0-9.,]/g, ''))} required placeholder="Ej: 10,5" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Unidad de medida</Form.Label>
            <Form.Control type="text" value={unidad_medida} onChange={e => setUnidadMedida(e.target.value)} placeholder="Ej: kg, lts, bolsas..." />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Código bit</Form.Label>
            <Form.Control type="number" value={codigo_bit} onChange={e => setCodigoBit(e.target.value)} placeholder="0 por defecto" min="0" />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button variant="primary" onClick={handleGuardar}>Agregar</Button>
      </Modal.Footer>
    </Modal>
  );
}
