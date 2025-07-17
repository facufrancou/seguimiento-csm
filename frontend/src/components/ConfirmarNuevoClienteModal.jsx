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
    <Modal show={show} onHide={onCancel} centered style={{ borderRadius: '10px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}>
      <Modal.Header closeButton style={{ backgroundColor: '#0a3d38', color: '#fff', borderRadius: '10px 10px 0 0' }}>
        <Modal.Title style={{ fontWeight: 'bold' }}>{esAltaManual ? 'Nuevo cliente' : 'Cliente no encontrado'}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '0 0 10px 10px' }}>
        {esAltaManual ? (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-2">
              <Form.Label style={{ fontWeight: 'bold', color: '#0a3d38' }}>Nombre</Form.Label>
              <Form.Control name="nombre" value={form.nombre} onChange={handleChange} required style={{ borderRadius: '5px', borderColor: '#0f574e' }} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label style={{ fontWeight: 'bold', color: '#0a3d38' }}>CUIT</Form.Label>
              <Form.Control name="cuit" value={form.cuit} onChange={handleChange} style={{ borderRadius: '5px', borderColor: '#0f574e' }} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label style={{ fontWeight: 'bold', color: '#0a3d38' }}>Domicilio</Form.Label>
              <Form.Control name="domicilio" value={form.domicilio} onChange={handleChange} style={{ borderRadius: '5px', borderColor: '#0f574e' }} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label style={{ fontWeight: 'bold', color: '#0a3d38' }}>Localidad</Form.Label>
              <Form.Control name="localidad" value={form.localidad} onChange={handleChange} style={{ borderRadius: '5px', borderColor: '#0f574e' }} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label style={{ fontWeight: 'bold', color: '#0a3d38' }}>Condición IVA</Form.Label>
              <Form.Control name="condicion_iva" value={form.condicion_iva} onChange={handleChange} style={{ borderRadius: '5px', borderColor: '#0f574e' }} />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button variant="secondary" onClick={onCancel} style={{ fontWeight: 'bold', borderRadius: '5px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}>Cancelar</Button>
              <Button variant="primary" type="submit" style={{ fontWeight: 'bold', borderRadius: '5px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', background: 'linear-gradient(90deg, #0f574e, #0a3d38)' }}>Guardar cliente</Button>
            </div>
          </Form>
        ) : (
          <>
            <p style={{ fontWeight: 'bold', color: '#0a3d38' }}>El cliente <b>{cliente?.nombre}</b> no existe en la base de datos.</p>
            <p style={{ fontWeight: 'bold', color: '#0a3d38' }}>¿Deseás guardarlo como nuevo cliente?</p>
          </>
        )}
      </Modal.Body>
      {!esAltaManual && (
        <Modal.Footer style={{ backgroundColor: '#fff', borderRadius: '0 0 10px 10px' }}>
          <Button variant="secondary" onClick={onCancel} style={{ fontWeight: 'bold', borderRadius: '5px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}>Cancelar</Button>
          <Button variant="primary" onClick={() => onConfirm(cliente)} style={{ fontWeight: 'bold', borderRadius: '5px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', background: 'linear-gradient(90deg, #0f574e, #0a3d38)' }}>Guardar cliente</Button>
        </Modal.Footer>
      )}
    </Modal>
  );
}
