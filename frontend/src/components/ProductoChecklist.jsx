import React, { useState, useEffect } from 'react';
import { getProductos } from '../services/api';

export default function ProductoChecklist({ onConfirm, soloLectura = false, productosIniciales = [] }) {
  const [productos, setProductos] = useState([]);
  const [seleccionados, setSeleccionados] = useState({});

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getProductos();
        setProductos(data);
        // Inicializar seleccionados si hay productosIniciales
        if (productosIniciales.length > 0) {
          const inicial = {};
          productosIniciales.forEach((p) => {
            if (p.producto_id) inicial[p.producto_id] = p.cantidad;
          });
          setSeleccionados(inicial);
        }
      } catch (err) {
        console.error('Error al cargar productos', err);
      }
    };
    fetch();
    // eslint-disable-next-line
  }, []);

  const handleToggle = (id) => {
    if (soloLectura) return;
    setSeleccionados((prev) => {
      const nuevo = { ...prev };
      if (nuevo[id]) {
        delete nuevo[id];
      } else {
        nuevo[id] = 1;
      }
      return nuevo;
    });
  };

  const handleCantidad = (id, cantidad) => {
    if (soloLectura) return;
    // Permitir vacío, coma, punto y números
    setSeleccionados((prev) => ({
      ...prev,
      [id]: cantidad
    }));
  };

  const handleConfirmar = () => {
    if (soloLectura) return;
    const seleccionFinal = productos
      .filter((p) => {
        const idValido = typeof p.id === 'number' && !isNaN(p.id) && p.id !== null;
        const val = seleccionados[p.id];
        // Permitir decimales y coma
        const cantidadValida = val !== undefined && val !== '' && !isNaN(Number(String(val).replace(',', '.')));
        return idValido && cantidadValida;
      })
      .map((p) => ({
        producto_id: p.id,
        nombre: p.nombre,
        unidad_medida: p.unidad_medida,
        codigo_bit: p.codigo_bit,
        cantidad: Number(String(seleccionados[p.id]).replace(',', '.'))
      }));
    onConfirm(seleccionFinal);
  };

  return (
    <div className="container-fluid mt-4 px-2 w-100">
      <h5>Seleccionar productos</h5>
      {productos.length === 0 ? (
        <p>Cargando productos...</p>
      ) : (
        <ul className="list-group">
          {productos.map((prod) => (
            <li key={prod.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <input
                  type="checkbox"
                  className="form-check-input me-2"
                  checked={!!seleccionados[prod.id]}
                  onChange={() => handleToggle(prod.id)}
                  disabled={soloLectura}
                />
                <span style={soloLectura ? { color: '#888' } : {}}>{prod.nombre}</span>
              </div>
              {seleccionados[prod.id] !== undefined && (
                <input
                  type="text"
                  inputMode="decimal"
                  className="form-control ms-2"
                  style={{ width: '80px', background: soloLectura ? '#eee' : undefined }}
                  value={seleccionados[prod.id] ?? ''}
                  onChange={(e) => handleCantidad(prod.id, e.target.value.replace(/[^0-9.,]/g, ''))}
                  disabled={soloLectura}
                />
              )}
            </li>
          ))}
        </ul>
      )}
      <div className="text-end mt-3">
        <button className="btn btn-primary" onClick={handleConfirmar} disabled={soloLectura}>
          Confirmar selección
        </button>
      </div>
    </div>
  );
}
