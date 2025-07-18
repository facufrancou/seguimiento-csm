import React, { useState, useEffect } from 'react';
import { crearRemito, getClientes, getProductos, parseRemitoPDF, crearCliente, crearProducto, getOperarios } from '../services/api';
import ConfirmEntregaModal from './ConfirmEntregaModal';
import ProductoChecklist from './ProductoChecklist';
import { Modal, Button } from 'react-bootstrap';
import ConfirmarNuevoClienteModal from './ConfirmarNuevoClienteModal';
import ConfirmarNuevoProductoModal from './ConfirmarNuevoProductoModal';
import QRCode from 'qrcode';
import ProductoManualModal from './ProductoManualModal';
import jsPDF from 'jspdf';
import ReactQRCode from 'react-qr-code';

export default function RemitoForm() {
  const [clientes, setClientes] = useState([]);
  const [clienteId, setClienteId] = useState('');
  const [fecha, setFecha] = useState('');
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [modalConfirmOpen, setModalConfirmOpen] = useState(false);
  const [modalProductosOpen, setModalProductosOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [parseando, setParseando] = useState(false);
  const [showNuevoCliente, setShowNuevoCliente] = useState(false);
  const [clientePendiente, setClientePendiente] = useState(null);
  const [showNuevoProducto, setShowNuevoProducto] = useState(false);
  const [productoPendiente, setProductoPendiente] = useState(null);
  const [parserDataPendiente, setParserDataPendiente] = useState(null);
  const [modoCarga, setModoCarga] = useState('pdf'); // 'pdf' o 'manual'
  const [qrUrl, setQrUrl] = useState('');
  const [operarios, setOperarios] = useState([]);
  const [operarioIds, setOperarioIds] = useState([]);
  const [showProductoManual, setShowProductoManual] = useState(false);
  const [productosPendientes, setProductosPendientes] = useState([]);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    const cargarClientes = async () => {
      const data = await getClientes();
      setClientes(data);
    };
    const cargarOperarios = async () => {
      const data = await getOperarios();
      setOperarios(data);
    };
    cargarClientes();
    cargarOperarios();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!productosSeleccionados.length) {
      alert('Debés agregar al menos un producto.');
      return;
    }
    setModalConfirmOpen(true);
  };
  

  const handleConfirmar = async () => {
    setLoading(true);
    try {
      const remito = {
        numero_remito: `REM-${Date.now()}`,
        cliente_id: clienteId,
        fecha_emision: fecha,
        condicion_operacion: 'Contado',
        observaciones: '',
        archivo_pdf: ''
      };

      console.log('Datos enviados al backend:', { remito, productos: productosSeleccionados });

      const res = await crearRemito({ remito, productos: productosSeleccionados, operarioIds });
      setSuccess('Remito cargado exitosamente.');
      setQrUrl(res.urlQR || '');

      // Limpiar el formulario
      setClienteId('');
      setFecha('');
      setProductosSeleccionados([]);
      setOperarioIds([]);
      setPdfFile(null);
      setModoCarga('pdf');

      // Mostrar el modal del QR
      setShowQRModal(true);
    } catch (err) {
      console.error('Error al crear remito:', err);
      if (err.response && err.response.status >= 400) {
        alert('Error al crear remito. Verificá la conexión o los datos.');
      }
    } finally {
      setLoading(false);
      setModalConfirmOpen(false);
    }
  };

  const abrirModalProductos = () => setModalProductosOpen(true);
  const cerrarModalProductos = () => setModalProductosOpen(false);

  const handleSeleccionProductos = (seleccion) => {
    setProductosSeleccionados(seleccion);
    cerrarModalProductos();
  };

  // Maneja la carga del archivo PDF y parseo
  const handlePDFChange = async (e) => {
    const file = e.target.files[0];
    console.log('Archivo seleccionado:', file);
    if (!file) return;
    setPdfFile(file);
    setParseando(true);
    try {
      const formData = new FormData();
      formData.append('pdf', file);
      const data = await parseRemitoPDF(formData);
      console.log('Respuesta del parser:', data);
      // Buscar cliente por nombre (ignora mayúsculas/minúsculas y espacios)
      let clienteIdDetectado = '';
      let clienteMatch = null;
      if (data.cliente && clientes.length > 0) {
        const normalizar = (str) => str
          ?.toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // quita tildes
          .replace(/[^a-z0-9]/gi, '')      // deja solo letras y números
          .trim();
        const normalizarCuit = (cuit) => cuit?.replace(/\D/g, '');
        // Salida de depuración para el matching de cliente
        console.log('--- DEPURACIÓN DE MATCH DE CLIENTE ---');
        console.log('Cliente del PDF (original):', data.cliente);
        console.log('Cliente del PDF (normalizado):', normalizar(data.cliente));
        if (data.cuit) {
          console.log('CUIT del PDF (original):', data.cuit);
          console.log('CUIT del PDF (normalizado):', normalizarCuit(data.cuit));
        }
        clientes.forEach((c, idx) => {
          console.log(`Cliente[${idx}] nombre (original):`, c.nombre);
          console.log(`Cliente[${idx}] nombre (normalizado):`, normalizar(c.nombre));
          if (c.cuit) {
            console.log(`Cliente[${idx}] CUIT (original):`, c.cuit);
            console.log(`Cliente[${idx}] CUIT (normalizado):`, normalizarCuit(c.cuit));
          }
        });
        clienteMatch = clientes.find(c =>
          (data.cuit && c.cuit && normalizarCuit(c.cuit) === normalizarCuit(data.cuit)) ||
          (normalizar(c.nombre) === normalizar(data.cliente))
        );
        if (clienteMatch) clienteIdDetectado = clienteMatch.id;
      }
      if (!clienteMatch && data.cliente) {
        setClientePendiente({
          nombre: data.cliente,
          cuit: data.cuit || '',
          domicilio: data.domicilio || '',
          localidad: data.localidad || '',
          condicion_iva: data.condicion_iva || ''
        });
        setParserDataPendiente(data); // Guardar datos del parser para después
        setShowNuevoCliente(true);
        setParseando(false);
        return;
      }
      setClienteId(clienteIdDetectado);
      // Asignar fecha y productos
      asignarFechaYProductos(data);
    } catch (err) {
      alert('No se pudo leer el PDF. Verificá el archivo.');
    } finally {
      setParseando(false);
    }
  };

  // Asignar fecha y productos desde datos del parser
  const asignarFechaYProductos = async (data) => {
    // Convertir fecha dd/mm/yyyy a yyyy-mm-dd si es necesario
    let fechaDetectada = data.fecha_emision || '';
    if (fechaDetectada && fechaDetectada.includes('/')) {
      const [d, m, y] = fechaDetectada.split('/');
      fechaDetectada = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    setFecha(fechaDetectada);
    // Match productos por nombre para obtener producto_id
    const productosBD = await getProductos();
    const normalizar = (str) => str?.toLowerCase().replace(/\s+/g, ' ').trim();
    let productosConId = (data.productos || []).map((prod) => {
      let match = productosBD.find(p => normalizar(p.nombre) === normalizar(prod.nombre));
      return {
        ...prod,
        producto_id: match ? match.id : null
      };
    });
    // Detectar todos los productos sin producto_id
    const faltantes = productosConId.filter(p => !p.producto_id);
    if (faltantes.length > 0) {
      setProductosPendientes(faltantes);
      setShowNuevoProducto(true);
      setProductosSeleccionados(productosConId);
      return;
    }
    setProductosSeleccionados(productosConId);
  };

  // Confirmar creación de cliente
  const handleConfirmarNuevoCliente = async (nuevoClienteForm) => {
    setShowNuevoCliente(false);
    if (!nuevoClienteForm) return;
    try {
      const nuevo = await crearCliente(nuevoClienteForm);
      // Recargar lista de clientes desde la base y seleccionar el nuevo
      const data = await getClientes();
      setClientes(data);
      setClienteId(nuevo.id);
      // Si había datos pendientes del parser, asignar fecha y productos
      if (parserDataPendiente) {
        asignarFechaYProductos(parserDataPendiente);
        setParserDataPendiente(null);
      }
    } catch (err) {
      alert('No se pudo crear el cliente.');
    }
    setClientePendiente(null);
  };

  // Confirmar creación de producto
  const handleConfirmarNuevoProducto = async () => {
    setShowNuevoProducto(false);
    if (!productosPendientes.length) return;
    // Crear todos los productos pendientes en la base
    for (const prod of productosPendientes) {
      try {
        const nuevo = await crearProducto({
          nombre: prod.nombre,
          unidad_medida: prod.unidad_medida,
          codigo_bit: prod.codigo_bit
        });
        setProductosSeleccionados((prev) => prev.map(p =>
          p.nombre === prod.nombre ? { ...p, producto_id: nuevo.id } : p
        ));
      } catch (err) {
        alert(`No se pudo crear el producto: ${prod.nombre}`);
      }
    }
    setProductosPendientes([]);
  };

  // Agregar producto manualmente
  const handleAgregarProductoManual = async (prod) => {
    if (!prod) return setShowProductoManual(false);
    // Crear producto en la base y luego agregarlo a la lista
    try {
      const nuevo = await crearProducto({
        nombre: prod.nombre,
        unidad_medida: prod.unidad_medida,
        codigo_bit: prod.codigo_bit
      });
      setProductosSeleccionados(prev => [
        ...prev,
        {
          producto_id: nuevo.id,
          nombre: prod.nombre,
          cantidad: prod.cantidad,
          unidad_medida: prod.unidad_medida,
          codigo_bit: prod.codigo_bit
        }
      ]);
    } catch (e) {
      alert('Error al crear el producto en la base.');
    }
    setShowProductoManual(false);
  };

  const handlePrintQR = async () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [215.9, 279.4], // Tamaño carta en mm (8.5 x 11 pulgadas)
    });

    // Configurar el QR en el centro de la página
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const qrSize = 50; // Tamaño del QR en mm
    const qrX = (pageWidth - qrSize) / 2;
    const qrY = (pageHeight - qrSize) / 2;

    try {
      // Generar el QR como base64
      const qrBase64 = await QRCode.toDataURL(qrUrl, {
        width: qrSize * 3.78, // Convertir mm a px (1 mm = 3.78 px)
        height: qrSize * 3.78,
      });

      // Dibujar el QR y texto centrado
      doc.setFontSize(16);
      doc.text('QR para validación', pageWidth / 2, qrY - 15, { align: 'center' });
      doc.addImage(qrBase64, 'PNG', qrX, qrY, qrSize, qrSize);

      // Descargar el PDF
      doc.save('QR_Remito.pdf');
    } catch (error) {
      console.error('Error al generar el QR:', error);
      alert('No se pudo generar el QR para el PDF.');
    }
  };

  return (
    <div className="productos-view">
      <div className="container">
        <h1 className="productos-title">Cargar nuevo remito</h1>
        
        {/* Modo de carga */}
        <div className="card">
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">
                <i className="fas fa-file-import"></i> Modo de carga
              </label>
              <select className="form-control" value={modoCarga} onChange={e => setModoCarga(e.target.value)}>
                <option value="manual">Carga manual</option>
                <option value="pdf">Cargar desde PDF</option>
              </select>
            </div>

            {modoCarga === 'pdf' && (
              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-file-pdf"></i> Cargar PDF de remito
                </label>
                <input type="file" className="form-control" accept="application/pdf" onChange={handlePDFChange} />
                <small className="form-text text-muted">
                  <i className="fas fa-info-circle"></i> Puede que algún artículo no se lea correctamente. Revisá y completá manualmente si es necesario.
                </small>
              </div>
            )}
      {modoCarga === 'pdf' && (
        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-group">
            <label className="form-label">
              <i className="fas fa-building"></i> Cliente
            </label>
            <select
              className="form-control"
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              required
            >
              <option value="">Seleccioná un cliente</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre}{cliente.cuit ? ` (${cliente.cuit})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              <i className="fas fa-calendar-alt"></i> Fecha
            </label>
            <input
              type="date"
              className="form-control"
              value={fecha || ''}
              onChange={e => setFecha(e.target.value)}
              required
              inputMode="none"
              placeholder="Seleccioná una fecha"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <i className="fas fa-box"></i> Productos
            </label>
            <div className="button-group mb-3">
              <button
                type="button"
                className="btn btn-primary me-2"
                onClick={abrirModalProductos}
              >
                <i className="fas fa-plus"></i> Agregar o modificar productos
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setShowProductoManual(true)}
              >
                <i className="fas fa-database"></i> Agregar producto a la base
              </button>
            </div>

            {productosSeleccionados.length > 0 ? (
              <ul className="product-list">
                {productosSeleccionados.map((p, idx) => (
                  <li key={idx} className="product-item">
                    <div className="product-details">
                      <span className="product-name">{p.nombre ? p.nombre : `ID: ${p.producto_id}`}</span>
                      <small className="product-info">
                        {p.unidad_medida ? `Unidad: ${p.unidad_medida}` : ''}
                        {p.codigo_bit !== undefined && p.codigo_bit !== null ? ` | Código bit: ${p.codigo_bit}` : ''}
                      </small>
                    </div>
                    <span className="product-quantity">{p.cantidad}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-message">
                <i className="fas fa-info-circle"></i> No se han seleccionado productos.
              </p>
            )
            }
          </div>

          <div className="form-group">
            <label className="form-label">
              <i className="fas fa-users"></i> Operarios responsables
            </label>
            <div className="operarios-container">
              {operarios.length === 0 && (
                <div className="empty-message">
                  <i className="fas fa-exclamation-circle"></i> No hay operarios disponibles.
                </div>
              )}
              {operarios.map(op => (
                <div className="form-check" key={op.id}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`operario-${op.id}`}
                    value={op.id}
                    checked={operarioIds.includes(String(op.id))}
                    onChange={e => {
                      if (e.target.checked) {
                        setOperarioIds([...operarioIds, String(op.id)]);
                      } else {
                        setOperarioIds(operarioIds.filter(id => id !== String(op.id)));
                      }
                    }}
                  />
                  <label className="form-check-label" htmlFor={`operario-${op.id}`}>{op.nombre}</label>
                </div>
              ))}
            </div>
            <small className="form-text text-muted">
              <i className="fas fa-info-circle"></i> Podés seleccionar uno o más operarios.
            </small>
          </div>

          <button type="submit" className="btn btn-primary mt-3">
            <i className="fas fa-save"></i> Guardar Remito
          </button>
        </form>
      )}
      {modoCarga === 'manual' && (
        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-group">
            <label className="form-label">
              <i className="fas fa-building"></i> Cliente
            </label>
            <div className="input-group">
              <select
                className="form-control"
                value={clienteId}
                onChange={e => setClienteId(e.target.value)}
                required
              >
                <option value="">Seleccioná un cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre}{cliente.cuit ? ` (${cliente.cuit})` : ''}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setClientePendiente({ nombre: '', cuit: '', domicilio: '', localidad: '', condicion_iva: '' });
                  setShowNuevoCliente(true);
                }}
              >
                <i className="fas fa-plus"></i> Nuevo cliente
              </button>
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">
              <i className="fas fa-calendar-alt"></i> Fecha
            </label>
            <input
              type="date"
              className="form-control"
              value={fecha || ''}
              onChange={e => setFecha(e.target.value)}
              required
              inputMode="none"
              placeholder="Seleccioná una fecha"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">
              <i className="fas fa-box"></i> Productos
            </label>
            <div className="button-group mb-3">
              <button
                type="button"
                className="btn btn-primary me-2"
                onClick={abrirModalProductos}
              >
                <i className="fas fa-plus"></i> Agregar o modificar productos
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowProductoManual(true)}
              >
                <i className="fas fa-database"></i> Agregar producto a la base
              </button>
            </div>
            
            {productosSeleccionados.length > 0 ? (
              <ul className="product-list">
                {productosSeleccionados.map((p, idx) => (
                  <li key={idx} className="product-item">
                    <div className="product-details">
                      <span className="product-name">{p.nombre ? p.nombre : `ID: ${p.producto_id}`}</span>
                      <small className="product-info">
                        {p.unidad_medida ? `Unidad: ${p.unidad_medida}` : ''}
                        {p.codigo_bit !== undefined && p.codigo_bit !== null ? ` | Código bit: ${p.codigo_bit}` : ''}
                      </small>
                    </div>
                    <span className="product-quantity">{p.cantidad}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-message">
                <i className="fas fa-info-circle"></i> No se han seleccionado productos.
              </p>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label">
              <i className="fas fa-users"></i> Operarios responsables
            </label>
            <div className="operarios-container">
              {operarios.length === 0 && (
                <div className="empty-message">
                  <i className="fas fa-exclamation-circle"></i> No hay operarios disponibles.
                </div>
              )}
              {operarios.map(op => (
                <div className="form-check" key={op.id}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`operario-${op.id}`}
                    value={op.id}
                    checked={operarioIds.includes(String(op.id))}
                    onChange={e => {
                      if (e.target.checked) {
                        setOperarioIds([...operarioIds, String(op.id)]);
                      } else {
                        setOperarioIds(operarioIds.filter(id => id !== String(op.id)));
                      }
                    }}
                  />
                  <label className="form-check-label" htmlFor={`operario-${op.id}`}>{op.nombre}</label>
                </div>
              ))}
            </div>
            <small className="form-text text-muted">
              <i className="fas fa-info-circle"></i> Podés seleccionar uno o más operarios.
            </small>
          </div>
          
          <button type="submit" className="btn btn-primary mt-3">
            <i className="fas fa-save"></i> Guardar Remito
          </button>
        </form>
      )}

      {/* Modal de confirmación */}
      <ConfirmEntregaModal
        show={modalConfirmOpen}
        onHide={() => setModalConfirmOpen(false)}
        onConfirm={handleConfirmar}
        titulo="Confirmar carga"
        mensaje="¿Deseás guardar este remito?"
        loading={loading}
      />

      {/* Modal para mostrar el QR */}
      <Modal show={showQRModal} onHide={() => setShowQRModal(false)} centered className="custom-modal">
        <Modal.Header closeButton>
          <Modal.Title>QR para validación</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <div className="qr-container">
            <ReactQRCode value={qrUrl} size={180} />
            <div className="mt-2 qr-url"><small>{qrUrl}</small></div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowQRModal(false)}>
            <i className="fas fa-times"></i> Cerrar
          </Button>
          <Button variant="primary" onClick={handlePrintQR}>
            <i className="fas fa-print"></i> Imprimir
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de selección de productos */}
      <Modal show={modalProductosOpen} onHide={cerrarModalProductos} size="lg" backdrop="static" centered className="custom-modal">
        <Modal.Header closeButton>
          <Modal.Title><i className="fas fa-box"></i> Seleccionar productos</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ProductoChecklist
            onConfirm={async (seleccion) => {
              // Traer productos de la base para completar datos faltantes
              const productosBD = await getProductos();
              const productosConDatos = seleccion.map((sel) => {
                const prodBD = productosBD.find((p) => p.id === sel.producto_id) || {};
                return {
                  ...sel,
                  nombre: sel.nombre || prodBD.nombre || '',
                  unidad_medida: sel.unidad_medida || prodBD.unidad_medida || '',
                  codigo_bit: sel.codigo_bit !== undefined ? sel.codigo_bit : (prodBD.codigo_bit !== undefined ? prodBD.codigo_bit : 0)
                };
              });
              setProductosSeleccionados(productosConDatos);
              cerrarModalProductos();
            }}
            productosIniciales={productosSeleccionados}
          />
        </Modal.Body>
      </Modal>

      {/* Modal para nuevo cliente */}
      <ConfirmarNuevoClienteModal
        show={showNuevoCliente}
        cliente={clientePendiente}
        onConfirm={handleConfirmarNuevoCliente}
        onCancel={() => { setShowNuevoCliente(false); setClientePendiente(null); }}
      />
      {/* Modal para nuevo producto */}
      <ConfirmarNuevoProductoModal
        show={showNuevoProducto}
        productos={productosPendientes}
        onConfirm={async () => {
          setShowNuevoProducto(false);
          if (!productosPendientes.length) return;
          // Crear todos los productos pendientes en la base
          for (const prod of productosPendientes) {
            try {
              const nuevo = await crearProducto({
                nombre: prod.nombre,
                unidad_medida: prod.unidad_medida,
                codigo_bit: prod.codigo_bit
              });
              setProductosSeleccionados((prev) => prev.map(p =>
                p.nombre === prod.nombre ? { ...p, producto_id: nuevo.id } : p
              ));
            } catch (err) {
              alert(`No se pudo crear el producto: ${prod.nombre}`);
            }
          }
          setProductosPendientes([]);
        }}
        onCancel={() => setShowNuevoProducto(false)}
      />
      {/* Modal para producto manual */}
      <ProductoManualModal
        show={showProductoManual}
        onConfirm={handleAgregarProductoManual}
        onCancel={() => setShowProductoManual(false)}
      />

      {success && (
        <div className="alert alert-success" role="alert">
          <i className="fas fa-check-circle"></i> {success}
          <button type="button" className="btn-close" aria-label="Close" onClick={() => setSuccess('')}></button>
        </div>
      )}
      
          </div>
        </div>
      </div>
    </div>
  );
}
