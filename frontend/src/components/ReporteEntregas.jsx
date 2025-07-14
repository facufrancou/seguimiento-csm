import React, { useEffect, useState } from 'react';
import { getReporteEntregas } from '../services/api';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';

export default function ReporteEntregas() {
  const [entregas, setEntregas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detalle, setDetalle] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalEntrega, setModalEntrega] = useState(null);

  const handleVerEntrega = async (entrega) => {
    try {
      setModalEntrega(entrega);
      setShowModal(true);
      const res = await axios.get(`/api/entregas/${entrega.remito_id}/detalle`);
      setDetalle(res.data);
    } catch (err) {
      setDetalle([]);
      alert('No se pudo obtener el detalle de productos');
    }
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const data = await getReporteEntregas();
        console.log('Reporte entregas:', data); // <-- log para depuración
        setEntregas(data);
      } catch (err) {
        alert('Error al cargar el reporte.');
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  return (
    <div className="container-fluid mt-4 px-2 w-100">
      <h4>Reporte de Entregas</h4>
      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3">Cargando datos...</p>
        </div>
      ) : (
        <>
          {entregas.length === 0 ? (
            <div className="alert alert-info mt-4">No hay entregas registradas.</div>
          ) : (
            <div className="table-responsive mt-3">
              <table className="table table-striped table-bordered">
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>Cliente</th>
                    <th>Fecha</th>
                    <th>Productos entregados</th>
                  </tr>
                </thead>
                <tbody>
                  {entregas.map((entrega, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{entrega.cliente}</td>
                      <td>{entrega.fecha_entrega ? new Date(entrega.fecha_entrega).toLocaleDateString() : ''}</td>
                      <td>
                        <ul className="mb-0">
                          <li>N° Remito: {entrega.numero_remito}</li>
                          <li>Operario: {entrega.operario || entrega.nombre_operario}</li>
                        </ul>
                        <Button variant="info" size="sm" className="mt-2" onClick={() => handleVerEntrega(entrega)}>
                          Ver entrega
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Detalle de productos entregados</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalEntrega && (
            <>
              <p><b>Cliente:</b> {modalEntrega.cliente}</p>
              <p><b>Fecha:</b> {modalEntrega.fecha_entrega ? new Date(modalEntrega.fecha_entrega).toLocaleDateString() : ''}</p>
              <p><b>N° Remito:</b> {modalEntrega.numero_remito}</p>
              <p><b>Operario:</b> {modalEntrega.operario || modalEntrega.nombre_operario}</p>
            </>
          )}
          <hr />
          <h6>Productos:</h6>
          {detalle.length === 0 ? (
            <p className="text-muted">No hay productos registrados para este remito.</p>
          ) : (
            <ul>
              {detalle.map((p, idx) => (
                <li key={idx}>
                  <b>{p.nombre}</b> - Cantidad: {p.cantidad} {p.unidad_medida || ''} {p.codigo_bit ? `| Código bit: ${p.codigo_bit}` : ''}
                </li>
              ))}
            </ul>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
