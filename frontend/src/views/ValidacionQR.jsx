import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Container, Card, Button, Alert, Spinner, Modal, Form } from 'react-bootstrap';
import { validarQR, registrarEntrega } from '../services/api';
import { FaTrashAlt, FaBarcode, FaPlus } from 'react-icons/fa';

export default function ValidacionQR() {
  const { token: paramToken } = useParams();
  const location = useLocation();
  const queryToken = new URLSearchParams(location.search).get('token');
  const token = paramToken || queryToken;

  const [remito, setRemito] = useState(null);
  const [productos, setProductos] = useState([]);
  const [operarios, setOperarios] = useState([]);
  const [operarioId, setOperarioId] = useState('');
  const [productosEscaneados, setProductosEscaneados] = useState([]);
  const [escaneando, setEscaneando] = useState(false);
  const [codigoBarra, setCodigoBarra] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [showManualModal, setShowManualModal] = useState(false);
  const [showConfirmacionParcial, setShowConfirmacionParcial] = useState(false);
  const [diferenciaProductos, setDiferenciaProductos] = useState([]);
  const [entregaParcial, setEntregaParcial] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidadManual, setCantidadManual] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    async function fetchRemito() {
      try {
        const data = await validarQR(token);
        setRemito(data);
        setProductos(data.productos || []);
        const res = await fetch(`/api/remitos/${data.id}/operarios`);
        const ops = await res.json();
        console.log('Respuesta de /api/remitos/:id/operarios', ops);
        // Si la respuesta tiene 'asignados' como array de IDs y 'todos' como array de objetos, filtrar los habilitados
        if (ops && Array.isArray(ops.asignados) && Array.isArray(ops.todos)) {
          const asignados = ops.todos.filter(op => ops.asignados.includes(op.id));
          setOperarios(asignados);
        } else if (ops && Array.isArray(ops.todos) && ops.todos.length > 0) {
          setOperarios(ops.todos);
        } else if (Array.isArray(ops) && ops.length > 0) {
          setOperarios(ops);
        } else {
          setOperarios([]);
        }
      } catch (err) {
        console.error('Error al validar QR:', err);
      }
    }
    fetchRemito();
  }, [token]);

  const iniciarEscaneo = () => {
    setEscaneando(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const manejarCodigoBarra = (codigo) => {
    const producto = productos.find((p) => p.codigo_barra === codigo);
    if (producto) {
      // Agregamos logging para verificar qué producto estamos escaneando
      console.log('Producto escaneado:', {
        id: producto.id,           // Este es el ID del registro en remito_productos
        producto_id: producto.producto_id, // Este es el ID del catálogo de productos
        nombre: producto.nombre,
        cantidad: 1
      });
      
      setProductosEscaneados((prev) => [...prev, { 
        ...producto, 
        cantidad: 1
      }]);
      setCodigoBarra('');
    }
  };
  
  const agregarProductoManual = () => {
    if (!productoSeleccionado || !cantidadManual || parseFloat(cantidadManual) <= 0) {
      return;
    }
    
    const producto = productos.find(p => p.id.toString() === productoSeleccionado);
    if (producto) {
      // Agregar logging para verificar producto seleccionado manualmente
      console.log('Producto agregado manualmente:', {
        id: producto.id,           // Este es el ID del registro en remito_productos
        producto_id: producto.producto_id, // Este es el ID del catálogo de productos
        nombre: producto.nombre,
        cantidad: parseFloat(cantidadManual)
      });
      
      setProductosEscaneados(prev => [
        ...prev, 
        { ...producto, cantidad: parseFloat(cantidadManual) }
      ]);
      
      setShowManualModal(false);
      setProductoSeleccionado('');
      setCantidadManual('');
    }
  };

  const validarCantidades = () => {
    // Sumar las cantidades escaneadas por ID de registro en remito_productos
    const totalEscaneados = productosEscaneados.reduce((acc, p) => {
      // Usamos el ID del registro en remito_productos, que es el que se usa en la tabla
      const registroId = p.id;
      acc[registroId] = (acc[registroId] || 0) + parseFloat(p.cantidad);
      return acc;
    }, {});
    
    console.log("Validando cantidades - Total escaneados:", totalEscaneados);
    console.log("Validando cantidades - Productos esperados:", productos);

    const diferencias = productos.map((producto) => {
      const cantidadEscaneada = totalEscaneados[producto.id] || 0;
      const cantidadSolicitada = parseFloat(producto.cantidad);
      return {
        id: producto.id,
        nombre: producto.nombre,
        cantidadSolicitada,
        cantidadEscaneada,
        diferencia: cantidadSolicitada - cantidadEscaneada
      };
    });

    const productosConProblemas = diferencias.filter(d => {
      // Usamos una tolerancia pequeña para comparar números de punto flotante
      const tolerancia = 0.001;
      return Math.abs(d.cantidadEscaneada - d.cantidadSolicitada) > tolerancia;
    });

    // Log detallado para depuración
    console.log("Productos con problemas:", productosConProblemas);

    // Si hay productos con problemas, no devolvemos false, sino un objeto con la información
    if (productosConProblemas.length > 0) {
      console.log("Se detectaron productos con diferencias, debería mostrar modal");
      return {
        completa: false,
        diferencias: productosConProblemas
      };
    }

    return {
      completa: true,
      diferencias: []
    };
  };

  const finalizarEntrega = async (forzarGuardar = false) => {
    console.log("========================================");
    console.log(`Iniciando finalizarEntrega, forzarGuardar=${forzarGuardar}`);
    console.log("========================================");
    
    try {
      // Validar que haya productos escaneados
      if (productosEscaneados.length === 0) {
        setModalMessage('No hay productos escaneados. Debe escanear al menos un producto para finalizar la entrega.');
        setShowModal(true);
        return;
      }
      
      // Validar que haya un operario seleccionado
      const operario = operarios.find(op => String(op.id) === String(operarioId));
      if (!operario) {
        setModalMessage('Debe seleccionar un operario para finalizar la entrega.');
        setShowModal(true);
        return;
      }

      // Determinar si la entrega es parcial basado en múltiples factores
      console.log("Productos escaneados:", productosEscaneados.length);
      console.log("Productos totales en remito:", productos.length);
      let esParcial;
      
      if (forzarGuardar) {
        // Si se está forzando el guardado desde confirmarEntregaParcial, siempre es parcial
        esParcial = true;
        console.log("Entrega forzada como parcial");
      } else {
        // Si no se fuerza, validamos cantidades
        const resultado = validarCantidades();
        console.log("Resultado de validación:", resultado);
        
        if (!resultado.completa) {
          // No está completa, mostramos modal y salimos
          console.log("Entrega incompleta detectada, mostrando modal de confirmación");
          console.log("Diferencias encontradas:", resultado.diferencias);
          
          // Actualizamos el estado para el modal
          setDiferenciaProductos(resultado.diferencias);
          
          // Mostramos el modal de confirmación
          console.log("Mostrando modal de confirmación parcial...");
          setShowConfirmacionParcial(true);
          
          // Debug para verificar cambio de estado
          console.log("Estado de showConfirmacionParcial después de set:", true);
          setTimeout(() => {
            console.log("Verificando estado del modal después de timeout:", showConfirmacionParcial);
          }, 100);
          
          // Importante: detener el flujo aquí
          console.log("Deteniendo flujo de función");
          return;
        } else {
          // Está completa
          esParcial = false;
          console.log("Entrega completa detectada");
        }
      }
      
      // Preparar los productos para enviar al backend
      // Agrupamos por ID para sumar las cantidades de múltiples escaneos del mismo producto
      const productosPorId = productosEscaneados.reduce((acc, p) => {
        // Este es el ID del registro en remito_productos que debemos enviar al backend
        const registroId = p.id; 
        
        if (!acc[registroId]) {
          acc[registroId] = { 
            producto_id: registroId, // ID del registro en remito_productos (no el ID del catálogo)
            cantidad: 0 
          };
        }
        acc[registroId].cantidad += parseFloat(p.cantidad);
        return acc;
      }, {});
      
      const productosFormatted = Object.values(productosPorId);
      
      // Depuración detallada de los productos que estamos enviando
      console.log("Productos escaneados original:", JSON.stringify(productosEscaneados));
      console.log("Productos formateados para enviar:", JSON.stringify(productosFormatted));
      
      // Verificar qué productos no están siendo escaneados (serán marcados como no entregados)
      const idsEscaneados = Object.keys(productosPorId).map(id => parseInt(id));
      const productosFaltantes = productos.filter(p => !idsEscaneados.includes(p.id));
      
      console.log("Productos que no fueron escaneados:", productosFaltantes.map(p => ({
        id: p.id,
        nombre: p.nombre,
        cantidad_esperada: p.cantidad
      })));

      console.log(`Enviando entrega con entrega_parcial=${esParcial}`);

      // Registrar si la entrega es parcial o completa
      const response = await registrarEntrega({
        token,
        operario_id: operarioId,
        nombre_operario: operario.nombre,
        productos: productosFormatted,
        entrega_parcial: esParcial // Enviar flag al backend
      });

      // Mostrar mensaje de éxito y resetear estados
      setModalMessage(`Entrega ${esParcial ? 'parcial' : 'completa'} registrada exitosamente.`);
      setShowModal(true);
      setProductosEscaneados([]);
      setOperarioId('');
      setEscaneando(false);
      setEntregaParcial(false);
      setRemito(null); // Eliminar datos del remito
    } catch (error) {
      console.error('Error al registrar entrega:', error);
      setModalMessage('Error al registrar la entrega.');
      setShowModal(true);
    }
  };
  
  // Función para confirmar entrega parcial
  const confirmarEntregaParcial = () => {
    console.log("Función confirmarEntregaParcial ejecutada");
    
    // Importante: primero actualizar el estado
    setEntregaParcial(true); 
    
    // Cerrar modal explícitamente
    console.log("Cerrando modal de confirmación parcial");
    setShowConfirmacionParcial(false);
    
    console.log("Confirmando entrega parcial - Estado actualizado");
    
    // Llamamos a finalizarEntrega con un timeout para asegurar que
    // el estado se haya actualizado antes de la llamada
    console.log("Programando finalización de entrega parcial");
    setTimeout(() => {
      console.log("Ejecutando finalizarEntrega(true) después del timeout");
      // El true fuerza el guardado como parcial 
      finalizarEntrega(true);
    }, 100);
  };

  if (!remito) {
    return (
      <Container fluid className="py-4 px-2 w-100">
        <Alert variant="success" className="mt-4">Entrega registrada correctamente.</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Card>
        <Card.Body>
          <h4 style={{ fontWeight: 'bold', color: '#343a40' }}>Entrega de Remito</h4>
          <p><strong style={{ color: '#6c757d' }}>N° Remito:</strong> {remito.numero_remito}</p>
          <p><strong style={{ color: '#6c757d' }}>Cliente:</strong> {remito.cliente_nombre}</p>
          <p><strong style={{ color: '#6c757d' }}>Fecha:</strong> {new Date(remito.fecha_emision).toLocaleDateString()}</p>
          <p><strong style={{ color: '#6c757d' }}>Productos a entregar:</strong></p>
          <div className="table-responsive">
            <table className="table table-striped table-bordered">
              <thead>
                <tr className="bg-light">
                  <th>Producto</th>
                  <th>Cantidad Solicitada</th>
                  <th>Cantidad Escaneada</th>
                  <th>Restantes</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((p) => {
                  // Calcular cantidad escaneada para este producto
                  const cantidadEscaneada = productosEscaneados
                    .filter(pe => pe.id === p.id)
                    .reduce((sum, pe) => sum + pe.cantidad, 0);
                  // Calcular restantes
                  const restantes = parseFloat(p.cantidad) - cantidadEscaneada;
                  
                  return (
                    <tr key={p.id}>
                      <td>{p.nombre}</td>
                      <td className="text-center">{p.cantidad}</td>
                      <td className="text-center">{cantidadEscaneada}</td>
                      <td className="text-center" style={{ 
                        color: restantes > 0 ? '#dc3545' : '#28a745',
                        fontWeight: 'bold'
                      }}>
                        {restantes}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mb-3">
            <label style={{ fontWeight: 'bold', color: '#343a40' }}>Operario que entrega</label>
            <select
              className="form-control"
              value={operarioId}
              onChange={(e) => setOperarioId(e.target.value)}
              style={{ borderColor: '#6c757d', borderRadius: '5px' }}
            >
              <option value="">Seleccionar operario</option>
              {operarios.map((op) => (
                <option key={op.id} value={op.id}>{op.nombre}</option>
              ))}
            </select>
          </div>
          <Button
            onClick={iniciarEscaneo}
            style={{ backgroundColor: '#007bff', borderColor: '#007bff', fontWeight: 'bold' }}
          >
            Escanear productos
          </Button>
        </Card.Body>
      </Card>

      {escaneando && (
        <Card className="mt-3">
          <Card.Body>
            <h5>Escaneo de productos</h5>
            <div className="d-flex mb-3">
              <div style={{ position: 'relative', flexGrow: 1, marginRight: '10px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ingresar código de barra"
                  value={codigoBarra}
                  onChange={(e) => {
                    const nuevoCodigo = e.target.value;
                    setCodigoBarra(nuevoCodigo);
                    manejarCodigoBarra(nuevoCodigo);
                  }}
                  ref={inputRef}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                  <FaBarcode size={20} color="#6c757d" />
                </div>
              </div>
              <Button 
                variant="success" 
                onClick={() => setShowManualModal(true)} 
                style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <FaPlus size={16} /> Agregar manual
              </Button>
            </div>
            <ul className="mt-3 list-group">
              {productosEscaneados.map((p, index) => (
                <li
                  key={index}
                  className="list-group-item d-flex justify-content-between align-items-center"
                  style={{ border: '1px solid #dee2e6', borderRadius: '5px', marginBottom: '5px' }}
                >
                  <span style={{ fontWeight: 'bold', color: '#495057' }}>{p.nombre} - {p.cantidad}</span>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setProductosEscaneados((prev) => {
                        const indexToRemove = prev.findIndex((prod, i) => i === index);
                        if (indexToRemove !== -1) {
                          const updatedList = [...prev];
                          updatedList.splice(indexToRemove, 1);
                          return updatedList;
                        }
                        return prev;
                      });
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                  >
                    <FaTrashAlt size={16} /> Eliminar
                  </Button>
                </li>
              ))}
            </ul>
            {productosEscaneados.length > 0 && operarioId && (
              <Button 
                className="mt-3" 
                onClick={() => {
                  console.log("Botón Finalizar entrega presionado");
                  finalizarEntrega();
                }}
              >
                Finalizar entrega
              </Button>
            )}
            {productosEscaneados.length > 0 && !operarioId && (
              <div className="alert alert-warning mt-3">
                Debe seleccionar un operario para finalizar la entrega.
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontWeight: 'bold', color: '#dc3545' }}>Aviso</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ fontSize: '16px', lineHeight: '1.5', color: '#333' }} dangerouslySetInnerHTML={{ __html: modalMessage }} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)} style={{ backgroundColor: '#6c757d', borderColor: '#6c757d' }}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para agregar productos manualmente */}
      <Modal show={showManualModal} onHide={() => setShowManualModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontWeight: 'bold', color: '#28a745' }}>
            Agregar producto manualmente
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Seleccionar producto</Form.Label>
              <Form.Select 
                value={productoSeleccionado} 
                onChange={(e) => setProductoSeleccionado(e.target.value)}
              >
                <option value="">Seleccionar un producto</option>
                {productos.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} (Solicitado: {p.cantidad})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Cantidad</Form.Label>
              <Form.Control 
                type="number" 
                step="0.01"
                placeholder="Ej: 3.50" 
                value={cantidadManual}
                onChange={(e) => setCantidadManual(e.target.value)}
              />
              <Form.Text className="text-muted">
                Para cantidades decimales use punto (.) como separador.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowManualModal(false)}>
            Cancelar
          </Button>
          <Button variant="success" onClick={agregarProductoManual}>
            Agregar producto
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para confirmar entrega parcial */}
      <div className="d-none">Estado modal: {showConfirmacionParcial ? 'Visible' : 'Oculto'}, Diferencias: {diferenciaProductos.length}</div>
      <Modal 
        show={showConfirmacionParcial && diferenciaProductos.length > 0} 
        onShow={() => console.log("Modal de confirmación parcial mostrado")}
        onHide={() => {
          console.log('Cerrando modal de confirmación parcial');
          setShowConfirmacionParcial(false);
        }}
        backdrop="static"
        keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontWeight: 'bold', color: '#ffc107' }}>
            Advertencia: Entrega Incompleta
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="alert alert-warning">
            <p><strong>La entrega no está completa.</strong> Se detectaron las siguientes diferencias:</p>
            <div className="table-responsive mt-3">
              <table className="table table-sm table-striped border">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Solicitado</th>
                    <th>Entregado</th>
                    <th>Diferencia</th>
                  </tr>
                </thead>
                <tbody>
                  {diferenciaProductos.map(p => (
                    <tr key={p.id}>
                      <td>{p.nombre}</td>
                      <td className="text-center">{p.cantidadSolicitada}</td>
                      <td className="text-center">{p.cantidadEscaneada}</td>
                      <td className="text-center font-weight-bold" style={{color: p.diferencia > 0 ? '#dc3545' : '#28a745'}}>
                        {p.diferencia > 0 ? `-${p.diferencia}` : `+${Math.abs(p.diferencia)}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3">¿Desea registrar esta entrega como parcial de todas formas?</p>
            <p className="text-danger"><small>Esta acción quedará registrada en el reporte de entregas.</small></p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmacionParcial(false)}>
            Cancelar
          </Button>
          <Button variant="warning" onClick={confirmarEntregaParcial}>
            Registrar entrega parcial
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
