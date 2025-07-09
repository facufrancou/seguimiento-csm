import React from 'react';
import { Modal, Button } from 'react-bootstrap';

export default function ConfirmEntregaModal({
  show,
  onHide,
  onConfirm,
  titulo = 'Confirmar acción',
  mensaje = '¿Estás seguro que deseas continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  loading = false
}) {
  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{titulo}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status" />
            <p className="mt-3 mb-0">Procesando...</p>
          </div>
        ) : (
          <p>{mensaje}</p>
        )}
      </Modal.Body>
      {!loading && (
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            {cancelText}
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            {confirmText}
          </Button>
        </Modal.Footer>
      )}
    </Modal>
  );
}
