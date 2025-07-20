import React, { useState, useEffect } from 'react';
import ConfirmarNuevoProductoModal from '../components/ConfirmarNuevoProductoModal';
import ProductoManualModal from '../components/ProductoManualModal';
import api from '../services/api';
import '../App.css';

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Función para cargar productos que se puede llamar cuando sea necesario
  const fetchProductos = async () => {
    try {
      const response = await api.get('/api/productos');
      console.log('Datos recibidos del backend:', response.data); // Log para verificar los datos
      setProductos(response.data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  useEffect(() => {
    // Cargar productos al montar el componente
    fetchProductos();

    // Simulación de validación de rol de administrador
    const userRole = localStorage.getItem('role');
    setIsAdmin(userRole === 'admin');
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredProductos = productos.filter((producto) =>
    producto && (
      producto.codigo?.includes(searchTerm) ||
      producto.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.codigo_barra?.includes(searchTerm)
    )
  );

  const totalPages = Math.ceil(filteredProductos.length / itemsPerPage);
  const paginatedProductos = filteredProductos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleEdit = (producto) => {
    console.log('Editando producto:', producto);
    setSelectedProducto(producto);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        await api.delete(`/api/productos/${id}`);
        
        // Actualización optimista de la UI (inmediata)
        setProductos(productos.filter((producto) => producto.id !== id));
        
        // Recargar datos desde el servidor para asegurarnos de tener datos actualizados
        await fetchProductos();
        
        alert('Producto eliminado correctamente');
      } catch (error) {
        console.error('Error al eliminar el producto:', error);
        alert('Error al eliminar el producto. Por favor, intente nuevamente.');
      }
    }
  };

  return (
    <div className="productos-view">
      <div className="container">
        <h1 className="productos-title">Gestión de Productos</h1>
        <input
          type="text"
          placeholder="Buscar por código, nombre o código de barra"
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
        <div className="table-responsive mt-3">
          <table className="table table-striped table-bordered" style={{ borderRadius: '10px', overflow: 'hidden', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}>
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Código de Barra</th>
                <th className="numeric">Precio</th>
                <th className="numeric">Stock</th>
                <th>Unidad de Medida</th>
                <th className="numeric">Código Bit</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProductos.map((producto, index) => (
                <tr key={producto.id}>
                  <td>{producto.id || 'Sin información'}</td>
                  <td>{producto.nombre || 'Sin información'}</td>
                  <td>{producto.codigo_barra || 'Sin información'}</td>
                  <td className="numeric">{producto.precio || 'Sin información'}</td>
                  <td className="numeric">{producto.stock || 'Sin información'}</td>
                  <td>{producto.unidad_medida || 'Sin información'}</td>
                  <td className="numeric">{producto.codigo_bit || 'Sin información'}</td>
                  <td>
                    <button 
                      className="btn btn-edit" 
                      onClick={() => handleEdit(producto)}
                    >
                      <i className="fas fa-edit"></i> Editar
                    </button>
                    {isAdmin && (
                      <button 
                        className="btn btn-delete" 
                        onClick={() => handleDelete(producto.id)}
                      >
                        <i className="fas fa-trash"></i> Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagination-controls">
          <button 
            className="btn" 
            onClick={handlePreviousPage} 
            disabled={currentPage === 1}
          >
            <i className="fas fa-chevron-left"></i> Anterior
          </button>
          <span>Página {currentPage} de {totalPages}</span>
          <button 
            className="btn" 
            onClick={handleNextPage} 
            disabled={currentPage === totalPages}
          >
            Siguiente <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>

      {selectedProducto && (
        <ProductoManualModal
          producto={selectedProducto}
          onClose={() => setSelectedProducto(null)}
          onSave={async (updatedProducto) => {
            try {
              // Actualizar localmente primero para una respuesta inmediata en la UI
              setProductos(productos.map(p => 
                p.id === updatedProducto.id ? updatedProducto : p
              ));
              
              // Recargar todos los productos para asegurar datos actualizados
              await fetchProductos();
              
              // Cerrar el modal
              setSelectedProducto(null);
              
              // Mostrar mensaje de éxito
              /* alert('Producto actualizado correctamente'); */
            } catch (error) {
              console.error('Error al actualizar la lista de productos:', error);
              alert('Error al actualizar el producto. Los cambios pueden no haberse guardado correctamente.');
            }
          }}
          isEditing={true}
        />
      )}
    </div>
  );
};

export default Productos;
