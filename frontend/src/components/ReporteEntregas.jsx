import React, { useEffect, useState } from 'react';
import { getReporteEntregas } from '../services/api';

export default function ReporteEntregas() {
  const [entregas, setEntregas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const data = await getReporteEntregas();
        setEntregas(data);
      } catch (err) {
        alert('Error al cargar el reporte.');
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  return (
    <div className="container-fluid mt-4 px-2 w-100">
      <h4>Reporte de Entregas</h4>
      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3">Cargando datos...</p>
        </div>
      ) : (
        <>
          {entregas.length === 0 ? (
            <div className="alert alert-info mt-4">No hay entregas registradas.</div>
          ) : (
            <div className="table-responsive mt-3">
              <table className="table table-striped table-bordered">
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
                      <td>{entrega.fecha}</td>
                      <td>
                        <ul className="mb-0">
                          {entrega.productos.map((p, j) => (
                            <li key={j}>{p.nombre} ({p.cantidad})</li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
