import React, { useState, useEffect } from 'react';
import { crearRemito, getClientes, getProductos, parseRemitoPDF, crearCliente, crearProducto, getOperarios } from '../services/api';
import ConfirmEntregaModal from './ConfirmEntregaModal';
import ProductoChecklist from './ProductoChecklist';
import { Modal } from 'react-bootstrap';
import ConfirmarNuevoClienteModal from './ConfirmarNuevoClienteModal';
import ConfirmarNuevoProductoModal from './ConfirmarNuevoProductoModal';
import QRCode from 'react-qr-code';
import ProductoManualModal from './ProductoManualModal';

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
      setClienteId('');
      setFecha('');
      setProductosSeleccionados([]);
    } catch (err) {
      alert('Error al crear remito. Verificá la conexión o los datos.');
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
    // Si hay productos sin producto_id, preguntar si desea crearlos
    const prodFaltante = productosConId.find(p => !p.producto_id);
    if (prodFaltante) {
      setProductoPendiente(prodFaltante);
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
    if (!productoPendiente) return;
    try {
      const nuevo = await crearProducto({ nombre: productoPendiente.nombre });
      // Actualizar productos seleccionados con el nuevo id
      setProductosSeleccionados((prev) => prev.map(p =>
        p.nombre === productoPendiente.nombre ? { ...p, producto_id: nuevo.id } : p
      ));
    } catch (err) {
      alert('No se pudo crear el producto.');
    }
    setProductoPendiente(null);
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

  return (
    <div className="container-fluid mt-4 px-2 w-100">
      <h4 className="mb-3">Cargar nuevo remito</h4>
      {/* Modo de carga */}
      <div className="mb-3">
        <label className="form-label">Modo de carga</label>
        <select className="form-control" value={modoCarga} onChange={e => setModoCarga(e.target.value)}>
          <option value="manual">Carga manual</option>
          <option value="pdf">Cargar desde PDF</option>
        </select>
      </div>
      {modoCarga === 'pdf' && (
        <div className="mb-3">
          <label className="form-label">Cargar PDF de remito</label>
          <input type="file" className="form-control" accept="application/pdf" onChange={handlePDFChange} />
          <small className="text-muted">Puede que algún artículo no se lea correctamente. Revisá y completá manualmente si es necesario.</small>
        </div>
      )}
      {modoCarga === 'pdf' && (
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Cliente</label>
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

          <div className="mb-3">
            <label className="form-label">Fecha</label>
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

          <div className="mb-3">
            <label className="form-label d-block">Productos</label>
            <div className="mb-3 d-flex gap-2 align-items-center">
              <button type="button" className="btn btn-outline-primary" onClick={abrirModalProductos}>
                Agregar o modificar productos
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => setShowProductoManual(true)}>
                Agregar producto a la base
              </button>
            </div>

            {productosSeleccionados.length > 0 ? (
              <ul className="list-group">
                {productosSeleccionados.map((p, idx) => (
                  <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                    <div className="d-flex flex-column">
                      <span className="fw-bold">{p.nombre ? p.nombre : `ID: ${p.producto_id}`}</span>
                      <small className="text-muted">
                        {p.unidad_medida ? `Unidad: ${p.unidad_medida}` : ''}
                        {p.codigo_bit !== undefined && p.codigo_bit !== null ? ` | Código bit: ${p.codigo_bit}` : ''}
                      </small>
                    </div>
                    <span className="badge bg-secondary fs-6">{p.cantidad}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">No se han seleccionado productos.</p>
            )
            }
          </div>

          <div className="mb-3">
            <label className="form-label">Operarios responsables</label>
            <div>
              {operarios.length === 0 && <div className="text-muted">No hay operarios disponibles.</div>}
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
            <small className="text-muted">Podés seleccionar uno o más operarios.</small>
          </div>

          <button type="submit" className="btn btn-success w-100">
            Guardar Remito
          </button>
        </form>
      )}
      {modoCarga === 'manual' && (
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Cliente</label>
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
                className="btn btn-outline-secondary"
                style={{ minWidth: 120 }}
                onClick={() => {
                  setClientePendiente({ nombre: '', cuit: '', domicilio: '', localidad: '', condicion_iva: '' });
                  setShowNuevoCliente(true);
                }}
              >
                Nuevo cliente
              </button>
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Fecha</label>
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
          <div className="mb-3">
            <label className="form-label d-block">Productos</label>
            <div className="mb-3 d-flex gap-2 align-items-center">
              <button type="button" className="btn btn-outline-primary" onClick={abrirModalProductos}>
                Agregar o modificar productos
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => setShowProductoManual(true)}>
                Agregar producto a la base
              </button>
            </div>
            {productosSeleccionados.length > 0 ? (
              <ul className="list-group">
                {productosSeleccionados.map((p, idx) => (
                  <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                    <div className="d-flex flex-column">
                      <span className="fw-bold">{p.nombre ? p.nombre : `ID: ${p.producto_id}`}</span>
                      <small className="text-muted">
                        {p.unidad_medida ? `Unidad: ${p.unidad_medida}` : ''}
                        {p.codigo_bit !== undefined && p.codigo_bit !== null ? ` | Código bit: ${p.codigo_bit}` : ''}
                      </small>
                    </div>
                    <span className="badge bg-secondary fs-6">{p.cantidad}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">No se han seleccionado productos.</p>
            )}
          </div>
          <div className="mb-3">
            <label className="form-label">Operarios responsables</label>
            <div>
              {operarios.length === 0 && <div className="text-muted">No hay operarios disponibles.</div>}
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
            <small className="text-muted">Podés seleccionar uno o más operarios.</small>
          </div>
          <button type="submit" className="btn btn-success w-100">
            Guardar Remito
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

      {/* Modal de selección de productos */}
      <Modal show={modalProductosOpen} onHide={cerrarModalProductos} size="lg" backdrop="static" centered>
        <Modal.Header closeButton>
          <Modal.Title>Seleccionar productos</Modal.Title>
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
        producto={productoPendiente}
        onConfirm={handleConfirmarNuevoProducto}
        onCancel={() => { setShowNuevoProducto(false); setProductoPendiente(null); }}
      />
      {/* Modal para producto manual */}
      <ProductoManualModal
        show={showProductoManual}
        onConfirm={handleAgregarProductoManual}
        onCancel={() => setShowProductoManual(false)}
      />

      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {success}
          <button type="button" className="btn-close" aria-label="Close" onClick={() => setSuccess('')}></button>
        </div>
      )}

      {qrUrl && (
        <div className="my-4 text-center">
          <h5>QR para validación</h5>
          <QRCode value={qrUrl} size={180} />
          <div className="mt-2"><small>{qrUrl}</small></div>
        </div>
      )}
    </div>
  );
}
