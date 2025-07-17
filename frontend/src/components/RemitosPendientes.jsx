import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';

export default function RemitosPendientes() {
  const [remitos, setRemitos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detalle, setDetalle] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalRemito, setModalRemito] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editRemito, setEditRemito] = useState(null);
  const [editDetalle, setEditDetalle] = useState([]);
  const [editOperarios, setEditOperarios] = useState([]);
  const [operarios, setOperarios] = useState([]);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQRData] = useState(null);

  useEffect(() => {
    const cargarRemitos = async () => {
      try {
        const res = await axios.get('/api/remitos?estado=pendiente');
        setRemitos(res.data);
      } catch (err) {
        setRemitos([]);
        alert('Error al cargar los remitos pendientes');
      } finally {
        setLoading(false);
      }
    };
    cargarRemitos();
  }, []);

  const handleVerRemito = async (remito) => {
    try {
      setModalRemito(remito);
      setShowModal(true);
      const res = await axios.get(`/api/entregas/${remito.id}/detalle`);
      setDetalle(res.data);
    } catch (err) {
      setDetalle([]);
      alert('No se pudo obtener el detalle de productos');
    }
  };

  const handleEditarRemito = (remito) => {
    setEditRemito(remito);
    setShowEditModal(true);
  };

  // Cargar detalle y operarios al abrir modal de edición
  useEffect(() => {
    if (showEditModal && editRemito) {
      (async () => {
        const detalleRes = await axios.get(`/api/entregas/${editRemito.id}/detalle`);
        setEditDetalle(detalleRes.data);
        const operariosRes = await axios.get(`/api/remitos/${editRemito.id}/operarios`);
        setEditOperarios(operariosRes.data.asignados);
        setOperarios(operariosRes.data.todos);
      })();
    }
  }, [showEditModal, editRemito]);

  const handleCantidadChange = (idx, value) => {
    setEditDetalle(prev => prev.map((p, i) => i === idx ? { ...p, cantidad: value } : p));
  };

  const handleOperarioToggle = (id) => {
    setEditOperarios(prev => prev.includes(id) ? prev.filter(o => o !== id) : [...prev, id]);
  };

  const handleGuardarEdicion = async () => {
    try {
      await axios.put(`/api/remitos/${editRemito.id}`, {
        productos: editDetalle.map(p => ({ producto_id: p.producto_id || p.id, cantidad: Number(p.cantidad) })),
        operarioIds: editOperarios
      });
      setShowEditModal(false);
      // Recargar remitos
      const res = await axios.get('/api/remitos?estado=pendiente');
      setRemitos(res.data);
      alert('Remito actualizado correctamente.');
    } catch (err) {
      alert('Error al guardar los cambios.');
    }
  };

  const handleRegenerarQR = async () => {
    try {
      const res = await axios.post(`/api/remitos/${editRemito.id}/generar-qr`);
      setQRData(res.data);
      setShowQRModal(true);
    } catch (err) {
      alert('Error al generar el QR');
    }
  };

  return (
    <div className="container-fluid mt-4 px-2 w-100" style={{ backgroundColor: '#f8f9fa', borderRadius: '10px', padding: '20px' }}>
      <h4 style={{ fontWeight: 'bold', color: '#343a40', textAlign: 'center' }}>Remitos pendientes de entrega</h4>
      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3" style={{ fontSize: '16px', color: '#6c757d' }}>Cargando datos...</p>
        </div>
      ) : (
        <>
          {remitos.length === 0 ? (
            <div className="alert alert-info mt-4" style={{ textAlign: 'center', fontWeight: 'bold' }}>No hay remitos pendientes.</div>
          ) : (
            <div className="table-responsive mt-3">
              <table className="table table-striped table-bordered" style={{ borderRadius: '10px', overflow: 'hidden', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}>
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>Cliente</th>
                    <th>Fecha</th>
                    <th>N° Remito</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {remitos
                    .filter(remito => !remito.entregado && (remito.estado === undefined || remito.estado === 'pendiente'))
                    .map((remito, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{remito.cliente_nombre}</td>
                        <td>{remito.fecha_emision ? new Date(remito.fecha_emision).toLocaleDateString() : ''}</td>
                        <td>{remito.numero_remito}</td>
                        <td>
                          <Button
                            variant="info"
                            size="sm"
                            className="me-2"
                            onClick={() => handleVerRemito(remito)}
                            style={{ fontWeight: 'bold', borderRadius: '5px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', background: 'linear-gradient(90deg, #17a2b8, #117a8b)' }}
                          >
                            Ver detalle
                          </Button>
                          <Button
                            variant="warning"
                            size="sm"
                            onClick={() => handleEditarRemito(remito)}
                            style={{ fontWeight: 'bold', borderRadius: '5px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', background: 'linear-gradient(90deg, #ffc107, #e0a800)' }}
                          >
                            Editar
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
      {/* Modal detalle remito */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered style={{ borderRadius: '10px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}>
        <Modal.Header closeButton style={{ backgroundColor: '#343a40', color: '#fff', borderRadius: '10px 10px 0 0' }}>
          <Modal.Title style={{ fontWeight: 'bold' }}>Detalle del remito</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '0 0 10px 10px' }}>
          {modalRemito && (
            <>
              <p><b style={{ color: '#495057' }}>Cliente:</b> {modalRemito.cliente}</p>
              <p><b style={{ color: '#495057' }}>Fecha:</b> {modalRemito.fecha_emision ? new Date(modalRemito.fecha_emision).toLocaleDateString() : ''}</p>
              <p><b style={{ color: '#495057' }}>N° Remito:</b> {modalRemito.numero_remito}</p>
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
        <Modal.Footer style={{ backgroundColor: '#f8f9fa', borderRadius: '0 0 10px 10px' }}>
          <Button variant="secondary" onClick={() => setShowModal(false)} style={{ fontWeight: 'bold', borderRadius: '5px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
      {/* Modal editar remito */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered style={{ borderRadius: '10px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}>
        <Modal.Header closeButton style={{ backgroundColor: '#343a40', color: '#fff', borderRadius: '10px 10px 0 0' }}>
          <Modal.Title style={{ fontWeight: 'bold' }}>Editar remito</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '0 0 10px 10px' }}>
          {editRemito && (
            <>
              <div className="mb-2">
                <label className="form-label" style={{ fontWeight: 'bold', color: '#343a40' }}>Cliente</label>
                <input className="form-control" value={editRemito.cliente_nombre} disabled style={{ background: '#eee', borderRadius: '5px' }} />
              </div>
              <div className="mb-2">
                <label className="form-label" style={{ fontWeight: 'bold', color: '#343a40' }}>Fecha</label>
                <input className="form-control" value={editRemito.fecha_emision ? new Date(editRemito.fecha_emision).toLocaleDateString() : ''} disabled style={{ background: '#eee', borderRadius: '5px' }} />
              </div>
              <div className="mb-2">
                <label className="form-label" style={{ fontWeight: 'bold', color: '#343a40' }}>N° Remito</label>
                <input className="form-control" value={editRemito.numero_remito} disabled style={{ background: '#eee', borderRadius: '5px' }} />
              </div>
              <hr />
              <h6 style={{ fontWeight: 'bold', color: '#343a40' }}>Productos</h6>
              {editDetalle.length === 0 ? (
                <p className="text-muted" style={{ textAlign: 'center' }}>No hay productos registrados para este remito.</p>
              ) : (
                <ul className="list-group mb-3">
                  {editDetalle.map((p, idx) => (
                    <li key={idx} className="list-group-item d-flex justify-content-between align-items-center" style={{ borderRadius: '5px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}>
                      <span style={{ fontWeight: 'bold', color: '#495057' }}><b>{p.nombre}</b> {p.unidad_medida ? `(${p.unidad_medida})` : ''} {p.codigo_bit ? `| Código bit: ${p.codigo_bit}` : ''}</span>
                      <input type="number" min="0" step="any" className="form-control ms-2" style={{ width: 90, borderRadius: '5px' }} value={p.cantidad} onChange={e => handleCantidadChange(idx, e.target.value)} />
                    </li>
                  ))}
                </ul>
              )}
              <h6 style={{ fontWeight: 'bold', color: '#343a40' }}>Operarios</h6>
              {operarios.length === 0 ? (
                <p className="text-muted" style={{ textAlign: 'center' }}>No hay operarios disponibles.</p>
              ) : (
                <div className="mb-2">
                  {operarios.map(op => (
                    <div className="form-check form-check-inline" key={op.id} style={{ borderRadius: '5px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}>
                      <input type="checkbox" className="form-check-input" id={`op-${op.id}`} checked={editOperarios.includes(op.id)} onChange={() => handleOperarioToggle(op.id)} />
                      <label className="form-check-label" htmlFor={`op-${op.id}`} style={{ fontWeight: 'bold', color: '#495057' }}>{op.nombre}</label>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: '#f8f9fa', borderRadius: '0 0 10px 10px' }}>
          <Button variant="secondary" onClick={() => setShowEditModal(false)} style={{ fontWeight: 'bold', borderRadius: '5px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}>Cerrar</Button>
          <Button variant="info" onClick={handleRegenerarQR} style={{ fontWeight: 'bold', borderRadius: '5px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', background: 'linear-gradient(90deg, #17a2b8, #117a8b)' }}>Regenerar QR</Button>
          <Button variant="primary" onClick={handleGuardarEdicion} style={{ fontWeight: 'bold', borderRadius: '5px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', background: 'linear-gradient(90deg, #007bff, #0056b3)' }}>Guardar cambios</Button>
        </Modal.Footer>
      </Modal>
      {/* Modal QR generado */}
      <Modal show={showQRModal} onHide={() => setShowQRModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>QR generado</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {qrData ? (
            <>
              <p><b>Token:</b> {qrData.token}</p>
              <p><b>Link:</b> <a href={qrData.urlQR} target="_blank" rel="noopener noreferrer">{qrData.urlQR}</a></p>
            </>
          ) : (
            <p>Generando QR...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowQRModal(false)}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
