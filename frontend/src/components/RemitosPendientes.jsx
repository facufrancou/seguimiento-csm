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
    <div className="productos-view">
      <div className="container">
        <h1 className="productos-title">Remitos pendientes de entrega</h1>
        {loading ? (
          <div className="loading-container">
            <div className="spinner">
              <i className="fas fa-spinner fa-spin"></i>
            </div>
            <p>Cargando datos...</p>
          </div>
        ) : (
          <>
            {remitos.length === 0 ? (
              <div className="alert alert-info">No hay remitos pendientes.</div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
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
                            <button
                              type="button"
                              className="btn btn-primary me-2"
                              onClick={() => handleVerRemito(remito)}
                            >
                              <i className="fas fa-eye"></i> Ver detalle
                            </button>
                            <button
                              type="button"
                              className="btn btn-warning"
                              onClick={() => handleEditarRemito(remito)}
                            >
                              <i className="fas fa-edit"></i> Editar
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
      {/* Modal detalle remito */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered className="custom-modal">
        <Modal.Header closeButton>
          <Modal.Title>Detalle del remito</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalRemito && (
            <>
              <div className="modal-info-row">
                <i className="fas fa-building"></i>
                <span className="modal-info-label">Cliente:</span> {modalRemito.cliente_nombre}
              </div>
              <div className="modal-info-row">
                <i className="fas fa-calendar-alt"></i>
                <span className="modal-info-label">Fecha:</span> {modalRemito.fecha_emision ? new Date(modalRemito.fecha_emision).toLocaleDateString() : ''}
              </div>
              <div className="modal-info-row">
                <i className="fas fa-file-invoice"></i>
                <span className="modal-info-label">N° Remito:</span> {modalRemito.numero_remito}
              </div>
            </>
          )}
          <hr />
          <h6 className="modal-subtitle">
            <i className="fas fa-box"></i> Productos:
          </h6>
          {detalle.length === 0 ? (
            <p className="empty-message">No hay productos registrados para este remito.</p>
          ) : (
            <ul className="product-list">
              {detalle.map((p, idx) => (
                <li key={idx} className="product-item">
                  <span className="product-name">{p.nombre}</span> - 
                  <span className="product-quantity">Cantidad: {p.cantidad} {p.unidad_medida || ''}</span>
                  {p.codigo_bit && <span className="product-code">| Código bit: {p.codigo_bit}</span>}
                </li>
              ))}
            </ul>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            <i className="fas fa-times"></i> Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal editar remito */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered className="custom-modal">
        <Modal.Header closeButton>
          <Modal.Title>Editar remito</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editRemito && (
            <>
              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-building"></i> Cliente
                </label>
                <input className="form-control" value={editRemito.cliente_nombre} disabled />
              </div>
              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-calendar-alt"></i> Fecha
                </label>
                <input className="form-control" value={editRemito.fecha_emision ? new Date(editRemito.fecha_emision).toLocaleDateString() : ''} disabled />
              </div>
              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-file-invoice"></i> N° Remito
                </label>
                <input className="form-control" value={editRemito.numero_remito} disabled />
              </div>
              <hr />
              <h6 className="modal-subtitle">
                <i className="fas fa-box"></i> Productos
              </h6>
              {editDetalle.length === 0 ? (
                <p className="empty-message">No hay productos registrados para este remito.</p>
              ) : (
                <ul className="list-group mb-3">
                  {editDetalle.map((p, idx) => (
                    <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                      <span className="product-name">{p.nombre} {p.unidad_medida ? `(${p.unidad_medida})` : ''} {p.codigo_bit ? `| Código bit: ${p.codigo_bit}` : ''}</span>
                      <input type="number" min="0" step="any" className="form-control form-control-sm ms-2" style={{ width: 90 }} value={p.cantidad} onChange={e => handleCantidadChange(idx, e.target.value)} />
                    </li>
                  ))}
                </ul>
              )}
              <h6 className="modal-subtitle">
                <i className="fas fa-users"></i> Operarios
              </h6>
              {operarios.length === 0 ? (
                <p className="empty-message">No hay operarios disponibles.</p>
              ) : (
                <div className="operarios-container">
                  {operarios.map(op => (
                    <div className="form-check form-check-inline" key={op.id}>
                      <input type="checkbox" className="form-check-input" id={`op-${op.id}`} checked={editOperarios.includes(op.id)} onChange={() => handleOperarioToggle(op.id)} />
                      <label className="form-check-label" htmlFor={`op-${op.id}`}>{op.nombre}</label>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            <i className="fas fa-times"></i> Cerrar
          </Button>
          <Button variant="info" onClick={handleRegenerarQR}>
            <i className="fas fa-qrcode"></i> Regenerar QR
          </Button>
          <Button variant="primary" onClick={handleGuardarEdicion}>
            <i className="fas fa-save"></i> Guardar cambios
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal QR generado */}
      <Modal show={showQRModal} onHide={() => setShowQRModal(false)} centered className="custom-modal">
        <Modal.Header closeButton>
          <Modal.Title>QR generado</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {qrData ? (
            <>
              <div className="modal-info-row">
                <i className="fas fa-key"></i>
                <span className="modal-info-label">Token:</span> {qrData.token}
              </div>
              <div className="modal-info-row">
                <i className="fas fa-link"></i>
                <span className="modal-info-label">Link:</span> 
                <a href={qrData.urlQR} target="_blank" rel="noopener noreferrer">{qrData.urlQR}</a>
              </div>
            </>
          ) : (
            <p className="loading-message">
              <i className="fas fa-spinner fa-spin"></i> Generando QR...
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowQRModal(false)}>
            <i className="fas fa-times"></i> Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
      
      </div>
    </div>
  );
}
