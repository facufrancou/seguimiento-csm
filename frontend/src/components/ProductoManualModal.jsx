import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import api from '../services/api';
import '../App.css';

export default function ProductoManualModal({ producto, onClose, onCancel, onSave, onConfirm, isEditing, show = true }) {
  // Unificar las funciones de cierre y guardado
  const handleClose = () => {
    if (onClose) onClose();
    if (onCancel) onCancel();
  };
  
  const handleSave = (data) => {
    if (onSave) onSave(data);
    if (onConfirm) onConfirm(data);
  };
  const [nombre, setNombre] = useState(producto ? producto.nombre : '');
  const [cantidad, setCantidad] = useState(producto ? producto.cantidad : '');
  const [unidad_medida, setUnidadMedida] = useState(producto ? producto.unidad_medida : '');
  const [codigo_bit, setCodigoBit] = useState(producto ? producto.codigo_bit : '');
  const [codigo_barra, setCodigoBarra] = useState(producto ? producto.codigo_barra : '');

  useEffect(() => {
    if (producto) {
      setNombre(producto.nombre || '');
      setCantidad(producto.cantidad || '');
      setUnidadMedida(producto.unidad_medida || '');
      setCodigoBit(producto.codigo_bit || '');
      setCodigoBarra(producto.codigo_barra || '');
    }
  }, [producto]);

  const [error, setError] = useState('');
  
  const handleGuardar = async () => {
    setError('');
    
    if (!nombre) {
      setError('El nombre del producto es obligatorio');
      return;
    }
    
    try {
      let updatedProducto;
      // Construimos el objeto de datos del producto asegurándonos de preservar todos los campos existentes
      const productoData = {
        nombre,
        cantidad: cantidad ? cantidad.replace(',', '.') : '',
        unidad_medida,
        codigo_bit: codigo_bit === '' ? 0 : parseInt(codigo_bit, 10) || 0,
        codigo_barra: codigo_barra || null, // Aseguramos que sea null si está vacío
      };
      
      if (isEditing && producto) {
        // Actualizar producto existente manteniendo los datos que no editamos
        const response = await api.put(`/api/productos/${producto.id}`, {
          ...producto, // Mantener todos los datos existentes
          ...productoData, // Sobrescribir con los datos editados
          id: producto.id
        });
        updatedProducto = response.data;
      } else {
        // Crear nuevo producto
        const response = await api.post('/api/productos', productoData);
        updatedProducto = response.data;
      }
      
      // Llamar al callback con el producto actualizado usando la función unificada
      handleSave(updatedProducto);
      
      // Limpiar formulario
      setNombre('');
      setCantidad('');
      setUnidadMedida('');
      setCodigoBit('');
      setCodigoBarra('');
    } catch (error) {
      console.error('Error al guardar el producto:', error);
      
      // Mejorar mensaje de error
      if (error.response) {
        // El servidor respondió con un estado de error
        setError(`Error ${error.response.status}: ${error.response.data.error || 'No se pudo guardar el producto'}`);
      } else if (error.request) {
        // La petición fue hecha pero no se recibió respuesta
        setError('No se pudo conectar con el servidor. Verifique su conexión o que el servidor esté en ejecución.');
      } else {
        // Error al configurar la petición
        setError(`Error al guardar: ${error.message}`);
      }
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    switch (name) {
      case 'nombre':
        setNombre(value);
        break;
      case 'cantidad':
        setCantidad(value.replace(/[^0-9.,]/g, ''));
        break;
      case 'unidad_medida':
        setUnidadMedida(value);
        break;
      case 'codigo_bit':
        setCodigoBit(value);
        break;
      case 'codigo_barra':
        setCodigoBarra(value);
        break;
      default:
        break;
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{producto ? 'Editar Producto' : 'Agregar producto manualmente'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="fas fa-exclamation-circle me-2"></i>
            {error}
          </div>
        )}
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={nombre}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Código de Barras</Form.Label>
            <Form.Control
              type="text"
              name="codigo_barra"
              value={codigo_barra}
              onChange={handleChange}
              placeholder="Ingrese el código de barras"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Cantidad</Form.Label>
            <Form.Control
              type="text"
              name="cantidad"
              value={cantidad}
              onChange={handleChange}
              required
              placeholder="Ej: 10,5"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Unidad de medida</Form.Label>
            <Form.Control
              type="text"
              name="unidad_medida"
              value={unidad_medida}
              onChange={handleChange}
              placeholder="Ej: kg, lts, bolsas..."
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Código bit</Form.Label>
            <Form.Control
              type="number"
              name="codigo_bit"
              value={codigo_bit}
              onChange={handleChange}
              placeholder="0 por defecto"
              min="0"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button className="btn btn-secondary" variant="secondary" onClick={handleClose}>Cancelar</Button>
        <Button className="btn btn-primary" variant="primary" onClick={handleGuardar}>{isEditing ? 'Guardar cambios' : 'Agregar'}</Button>
      </Modal.Footer>
    </Modal>
  );
}
