import React from 'react';
import { Modal, Button } from 'react-bootstrap';

export default function ConfirmarNuevoProductoModal({ show, productos, onConfirm, onCancel }) {
  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>Productos no encontrados</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Los siguientes productos no existen en la base de datos:</p>
        <ul>
          {productos?.map((prod, idx) => (
            <li key={idx}>
              <b>{prod.nombre}</b>
              {prod.unidad_medida ? ` | Unidad: ${prod.unidad_medida}` : ''}
              {prod.codigo_bit ? ` | Código bit: ${prod.codigo_bit}` : ''}
            </li>
          ))}
        </ul>
        <p>¿Deseás guardarlos como nuevos productos?</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button variant="primary" onClick={onConfirm}>Guardar todos</Button>
      </Modal.Footer>
    </Modal>
  );
}
