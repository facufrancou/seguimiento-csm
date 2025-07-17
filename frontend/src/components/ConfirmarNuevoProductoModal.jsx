import React from 'react';
import { Modal, Button } from 'react-bootstrap';

export default function ConfirmarNuevoProductoModal({ show, productos, onConfirm, onCancel }) {
  return (
    <Modal show={show} onHide={onCancel} centered style={{ borderRadius: '10px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}>
      <Modal.Header closeButton style={{ backgroundColor: '#0a3d38', color: '#fff', borderRadius: '10px 10px 0 0' }}>
        <Modal.Title style={{ fontWeight: 'bold' }}>Productos no encontrados</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '0 0 10px 10px' }}>
        <p style={{ fontWeight: 'bold', color: '#0a3d38' }}>Los siguientes productos no existen en la base de datos:</p>
        <ul>
          {productos?.map((prod, idx) => (
            <li key={idx} style={{ fontWeight: 'bold', color: '#0a3d38' }}>
              <b>{prod.nombre}</b>
              {prod.unidad_medida ? ` | Unidad: ${prod.unidad_medida}` : ''}
              {prod.codigo_bit ? ` | Código bit: ${prod.codigo_bit}` : ''}
            </li>
          ))}
        </ul>
        <p style={{ fontWeight: 'bold', color: '#0a3d38' }}>¿Deseás guardarlos como nuevos productos?</p>
      </Modal.Body>
      <Modal.Footer style={{ backgroundColor: '#fff', borderRadius: '0 0 10px 10px' }}>
        <Button variant="secondary" onClick={onCancel} style={{ fontWeight: 'bold', borderRadius: '5px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}>Cancelar</Button>
        <Button
          variant="primary"
          onClick={onConfirm}
          style={{
            fontWeight: 'bold',
            borderRadius: '5px',
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
            background: 'linear-gradient(90deg, #0f574e, #0a3d38)',
            color: '#fff'
          }}
        >
          Guardar todos
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
