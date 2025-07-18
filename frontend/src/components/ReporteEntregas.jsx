import React, { useEffect, useState } from 'react';
import { getReporteEntregas } from '../services/api';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function ReporteEntregas() {
  const [entregas, setEntregas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detalle, setDetalle] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalEntrega, setModalEntrega] = useState(null);
  const [filtroCliente, setFiltroCliente] = useState('');
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);

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
        console.log('Inicializando vista vacía');
        setEntregas([]); // Aseguramos que la vista esté vacía
      } catch (err) {
        console.error('Error al inicializar la vista:', err);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  useEffect(() => {
    setEntregas([]); // Aseguramos que el estado inicial esté vacío
  }, []);

  const filtrarEntregas = async () => {
    try {
      console.log('Iniciando filtrado de entregas');
      console.log('Fecha inicio ingresada:', fechaInicio);
      console.log('Fecha fin ingresada:', fechaFin);

      const data = await getReporteEntregas();
      console.log('Datos obtenidos:', data);
      let filtradas = data;

      if (filtroCliente.trim() !== '') {
        console.log('Aplicando filtro por cliente:', filtroCliente);
        filtradas = filtradas.filter(entrega =>
          entrega.cliente.toLowerCase().includes(filtroCliente.toLowerCase())
        );
        console.log('Entregas filtradas por cliente:', filtradas);
      }

      if (fechaInicio && fechaFin) {
        console.log('Aplicando filtro por rango de fechas:', fechaInicio, fechaFin);
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);

        // Normalizamos las fechas para comparar solo los días
        inicio.setHours(0, 0, 0, 0);
        fin.setHours(23, 59, 59, 999);

        console.log('Fecha inicio normalizada:', inicio);
        console.log('Fecha fin normalizada:', fin);

        filtradas = filtradas.filter(entrega => {
          const fechaEntrega = new Date(entrega.fecha_entrega);
          fechaEntrega.setHours(0, 0, 0, 0); // Normalizamos la fecha de entrega para eliminar la información de tiempo
          return fechaEntrega >= inicio && fechaEntrega <= fin;
        });
        console.log('Entregas filtradas por rango de fechas:', filtradas);
      } else {
        console.warn('Fechas de inicio o fin no válidas:', fechaInicio, fechaFin);
      }

      // Ordenamos las entregas por fecha de entrega en orden descendente
      filtradas.sort((a, b) => new Date(b.fecha_entrega) - new Date(a.fecha_entrega));

      setEntregas(filtradas);
      console.log('Estado final de entregas:', filtradas);
    } catch (err) {
      console.error('Error al filtrar entregas:', err);
      setEntregas([]);
    }
  };

  useEffect(() => {
    if (filtroCliente.trim() !== '' || (fechaInicio && fechaFin)) {
      filtrarEntregas();
    }
  }, [filtroCliente, fechaInicio, fechaFin]);

  const handleLimpiarFiltros = () => {
    setFiltroCliente('');
    setFechaInicio(null);
    setFechaFin(null);
    setEntregas([]);
  };

  return (
    <div>
      <div className="search-section">
        <input
          type="text"
          className="search-input"
          placeholder="Buscar por cliente"
          value={filtroCliente}
          onChange={(e) => setFiltroCliente(e.target.value)}
        />
      </div>
      
      <div className="d-flex gap-3 mb-4 justify-content-center">
        <Form.Group controlId="fechaInicio" style={{ maxWidth: '180px' }}>
          <Form.Label className="form-label">Fecha inicio</Form.Label>
          <DatePicker
            selected={fechaInicio}
            onChange={(date) => setFechaInicio(date)}
            dateFormat="dd/MM/yyyy"
            className="form-control"
          />
        </Form.Group>

        <Form.Group controlId="fechaFin" style={{ maxWidth: '180px' }}>
          <Form.Label className="form-label">Fecha fin</Form.Label>
          <DatePicker
            selected={fechaFin}
            onChange={(date) => setFechaFin(date)}
            dateFormat="dd/MM/yyyy"
            className="form-control"
          />
        </Form.Group>
      </div>
      
      <div className="d-flex justify-content-center gap-3 mt-4">
        <Button
          variant="primary"
          className="btn btn-primary"
          onClick={async () => {
            await filtrarEntregas();
          }}
        >
          <i className="fas fa-search"></i> Ver Todo
        </Button>

        <Button
          variant="secondary"
          className="btn btn-secondary"
          onClick={handleLimpiarFiltros}
        >
          <i className="fas fa-times"></i> Limpiar filtros
        </Button>
      </div>
      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3" style={{ fontSize: '16px', color: '#6c757d' }}>Cargando datos...</p>
        </div>
      ) : (
        <>
          {entregas.length === 0 ? (
            <div className="alert alert-info mt-4" style={{ textAlign: 'center', fontWeight: 'bold' }}>No hay entregas registradas.</div>
          ) : (
            <div className="table-responsive mt-3">
              <table className="table table-striped table-bordered" style={{ borderRadius: '10px', overflow: 'hidden', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}>
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>Cliente</th>
                    <th>Fecha</th>
                    <th>N° Remito</th>
                    <th>Operario</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {entregas.map((entrega, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{entrega.cliente || 'Sin información'}</td>
                      <td>{entrega.fecha_entrega ? new Date(entrega.fecha_entrega).toLocaleDateString() : 'Sin información'}</td>
                      <td>{entrega.numero_remito || 'Sin información'}</td>
                      <td>{entrega.operario || entrega.nombre_operario || 'Sin información'}</td>
                      <td>
                        <button 
                          className="btn btn-edit" 
                          onClick={() => handleVerEntrega(entrega)}
                        >
                          <i className="fas fa-eye"></i> Ver detalle
                        </button>
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
            <div className="mb-4">
              <div className="row mb-2">
                <div className="col-4 fw-bold">Cliente:</div>
                <div className="col-8">{modalEntrega.cliente}</div>
              </div>
              <div className="row mb-2">
                <div className="col-4 fw-bold">Fecha:</div>
                <div className="col-8">{modalEntrega.fecha_entrega ? new Date(modalEntrega.fecha_entrega).toLocaleDateString() : 'Sin información'}</div>
              </div>
              <div className="row mb-2">
                <div className="col-4 fw-bold">N° Remito:</div>
                <div className="col-8">{modalEntrega.numero_remito || 'Sin información'}</div>
              </div>
              <div className="row mb-2">
                <div className="col-4 fw-bold">Operario:</div>
                <div className="col-8">{modalEntrega.operario || modalEntrega.nombre_operario || 'Sin información'}</div>
              </div>
            </div>
          )}
          <hr />
          <h6 className="mb-3">Productos:</h6>
          {detalle.length === 0 ? (
            <div className="alert alert-info">No hay productos registrados para este remito.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm table-bordered">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Unidad</th>
                    <th>Código Bit</th>
                  </tr>
                </thead>
                <tbody>
                  {detalle.map((p, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>{p.nombre || 'Sin información'}</td>
                      <td className="numeric">{p.cantidad || 'Sin información'}</td>
                      <td>{p.unidad_medida || 'Sin información'}</td>
                      <td className="numeric">{p.codigo_bit || 'Sin información'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn btn-secondary" onClick={() => setShowModal(false)}>
            <i className="fas fa-times"></i> Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
