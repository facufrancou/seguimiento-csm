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
          <Button
            variant="secondary"
            onClick={onHide}
            style={{
              fontWeight: 'bold',
              borderRadius: '5px',
              boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
              background: 'linear-gradient(90deg, #0f574e, #0a3d38)',
              color: '#fff'
            }}
          >
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
