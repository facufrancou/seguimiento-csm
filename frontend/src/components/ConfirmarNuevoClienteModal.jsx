import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

export default function ConfirmarNuevoClienteModal({ show, cliente, onConfirm, onCancel }) {
  // Si el cliente viene vacío (carga manual), permitir editar todos los campos
  const [form, setForm] = useState({ nombre: '', cuit: '', domicilio: '', localidad: '', condicion_iva: '' });

  useEffect(() => {
    setForm({
      nombre: cliente?.nombre || '',
      cuit: cliente?.cuit || '',
      domicilio: cliente?.domicilio || '',
      localidad: cliente?.localidad || '',
      condicion_iva: cliente?.condicion_iva || ''
    });
  }, [cliente, show]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.nombre) return;
    onConfirm(form);
  };

  // Si el cliente tiene nombre, es flujo PDF: solo confirmación. Si no, es alta manual: formulario.
  const esAltaManual = !cliente?.nombre;

  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>{esAltaManual ? 'Nuevo cliente' : 'Cliente no encontrado'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {esAltaManual ? (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-2">
              <Form.Label>Nombre</Form.Label>
              <Form.Control name="nombre" value={form.nombre} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>CUIT</Form.Label>
              <Form.Control name="cuit" value={form.cuit} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Domicilio</Form.Label>
              <Form.Control name="domicilio" value={form.domicilio} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Localidad</Form.Label>
              <Form.Control name="localidad" value={form.localidad} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Condición IVA</Form.Label>
              <Form.Control name="condicion_iva" value={form.condicion_iva} onChange={handleChange} />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
              <Button variant="primary" type="submit">Guardar cliente</Button>
            </div>
          </Form>
        ) : (
          <>
            <p>El cliente <b>{cliente?.nombre}</b> no existe en la base de datos.</p>
            <p>¿Deseás guardarlo como nuevo cliente?</p>
          </>
        )}
      </Modal.Body>
      {!esAltaManual && (
        <Modal.Footer>
          <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
          <Button variant="primary" onClick={() => onConfirm(cliente)}>Guardar cliente</Button>
        </Modal.Footer>
      )}
    </Modal>
  );
}
