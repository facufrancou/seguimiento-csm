import React from 'react';
import { Modal, Button } from 'react-bootstrap';

export default function ConfirmarNuevoProductoModal({ show, producto, onConfirm, onCancel }) {
  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>Producto no encontrado</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>El producto <b>{producto?.nombre}</b> no existe en la base de datos.</p>
        <p>¿Deseás guardarlo como nuevo producto?</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button variant="primary" onClick={onConfirm}>Guardar producto</Button>
      </Modal.Footer>
    </Modal>
  );
}
