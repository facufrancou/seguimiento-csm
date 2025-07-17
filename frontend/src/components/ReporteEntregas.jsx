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
    <div className="container-fluid mt-4 px-2 w-100" style={{ backgroundColor: '#f8f9fa', borderRadius: '10px', padding: '20px' }}>
      <h4 style={{ fontWeight: 'bold', color: '#343a40', textAlign: 'center' }}>Reporte de Entregas</h4>
      <div className="mt-4 w-100 d-flex flex-column align-items-center">
        <input
          type="text"
          className="form-control mb-4"
          placeholder="Buscar por cliente"
          style={{ maxWidth: '400px', borderColor: '#6c757d', borderRadius: '5px' }}
          value={filtroCliente}
          onChange={(e) => setFiltroCliente(e.target.value)}
        />
        <div className="d-flex gap-3">
          <Form.Group controlId="fechaInicio" style={{ maxWidth: '180px' }}>
            <Form.Label>Fecha inicio</Form.Label>
            <DatePicker
              selected={fechaInicio}
              onChange={(date) => setFechaInicio(date)}
              dateFormat="dd/MM/yyyy"
              className="form-control"
              style={{ borderColor: '#6c757d', borderRadius: '5px' }}
            />
          </Form.Group>

          <Form.Group controlId="fechaFin" style={{ maxWidth: '180px' }}>
            <Form.Label>Fecha fin</Form.Label>
            <DatePicker
              selected={fechaFin}
              onChange={(date) => setFechaFin(date)}
              dateFormat="dd/MM/yyyy"
              className="form-control"
              style={{ borderColor: '#6c757d', borderRadius: '5px' }}
            />
          </Form.Group>
        </div>
        <div className="d-flex justify-content-center gap-3 mt-4">
          <Button
            variant="primary"
            onClick={async () => {
              await filtrarEntregas();
            }}
            style={{ fontWeight: 'bold', width: '200px', height: '50px', borderRadius: '8px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', background: 'linear-gradient(90deg, #007bff, #0056b3)' }}
          >
            Ver Todo
          </Button>

          <Button
            variant="primary"
            onClick={handleLimpiarFiltros}
            style={{ fontWeight: 'bold', width: '200px', height: '50px', borderRadius: '8px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', background: 'linear-gradient(90deg, #007bff, #0056b3)' }}
          >
            Limpiar filtros
          </Button>
        </div>
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
              <table className="table table-striped table-bordered" style={{ borderRadius: '10px', overflow: 'hidden' }}>
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
                          <li style={{ fontWeight: 'bold', color: '#495057' }}>N° Remito: {entrega.numero_remito}</li>
                          <li style={{ fontWeight: 'bold', color: '#495057' }}>Operario: {entrega.operario || entrega.nombre_operario}</li>
                        </ul>
                        <Button
                          variant="info"
                          size="sm"
                          className="mt-2"
                          onClick={() => handleVerEntrega(entrega)}
                          style={{ fontWeight: 'bold' }}
                        >
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
          <Modal.Title style={{ fontWeight: 'bold', color: '#343a40' }}>Detalle de productos entregados</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalEntrega && (
            <>
              <p><b style={{ color: '#495057' }}>Cliente:</b> {modalEntrega.cliente}</p>
              <p><b style={{ color: '#495057' }}>Fecha:</b> {modalEntrega.fecha_entrega ? new Date(modalEntrega.fecha_entrega).toLocaleDateString() : ''}</p>
              <p><b style={{ color: '#495057' }}>N° Remito:</b> {modalEntrega.numero_remito}</p>
              <p><b style={{ color: '#495057' }}>Operario:</b> {modalEntrega.operario || modalEntrega.nombre_operario}</p>
            </>
          )}
          <hr />
          <h6 style={{ fontWeight: 'bold', color: '#343a40' }}>Productos:</h6>
          {detalle.length === 0 ? (
            <p className="text-muted" style={{ textAlign: 'center' }}>No hay productos registrados para este remito.</p>
          ) : (
            <ul>
              {detalle.map((p, idx) => (
                <li key={idx} style={{ fontWeight: 'bold', color: '#495057' }}>
                  <b>{p.nombre}</b> - Cantidad: {p.cantidad} {p.unidad_medida || ''} {p.codigo_bit ? `| Código bit: ${p.codigo_bit}` : ''}
                </li>
              ))}
            </ul>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)} style={{ fontWeight: 'bold' }}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
