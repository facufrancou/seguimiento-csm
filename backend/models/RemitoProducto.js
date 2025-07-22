// models/RemitoProducto.js
const db = require('../config/db');

const RemitoProducto = {
  async insertBatch(remito_id, productos) {
    const values = productos.map(p => [remito_id, p.producto_id, p.cantidad]);
    await db.query(
      'INSERT INTO remito_productos (remito_id, producto_id, cantidad) VALUES ?',
      [values]
    );
  },

  async getByRemito(remito_id) {
    const [rows] = await db.query(`
      SELECT 
        rp.*, 
        p.nombre, 
        p.codigo_bit, 
        p.codigo_barra,
        p.unidad_medida, 
        rp.cantidad as cantidad_solicitada,
        CASE
          WHEN rp.cantidad_entregada IS NULL AND rp.entregado = 1 THEN rp.cantidad
          WHEN rp.cantidad_entregada IS NULL THEN 0
          ELSE rp.cantidad_entregada
        END as cantidad_entregada,
        CASE 
          WHEN rp.entregado = 0 THEN 'No entregado'
          WHEN rp.cantidad_entregada = 0 THEN 'No entregado'
          WHEN rp.cantidad_entregada IS NULL AND rp.entregado = 0 THEN 'No entregado'
          WHEN rp.cantidad_entregada IS NULL AND rp.entregado = 1 THEN 'Completo'
          WHEN ABS(rp.cantidad_entregada - rp.cantidad) < 0.01 THEN 'Completo'
          WHEN rp.cantidad_entregada < rp.cantidad THEN 'Parcial'
          WHEN rp.cantidad_entregada > rp.cantidad THEN 'Excedido'
          ELSE 'No entregado'
        END as estado_entrega
      FROM remito_productos rp
      JOIN productos p ON rp.producto_id = p.id
      WHERE rp.remito_id = ?
    `, [remito_id]);
    
    console.log('[DEBUG] getByRemito resultados:', rows.length);
    for (const row of rows) {
      console.log('[DEBUG] Datos de producto:', {
        id: row.id,
        producto_id: row.producto_id,
        nombre: row.nombre,
        entregado: row.entregado,
        cantidad_solicitada: row.cantidad_solicitada,
        cantidad_entregada: row.cantidad_entregada,
        estado_entrega: row.estado_entrega
      });
    }
    
    return rows;
  },

  async marcarEntregado(remito_id, producto_id, cantidad_entregada = null, entregado = true) {
    // Si tenemos una cantidad entregada, la usamos; de lo contrario, solo marcamos si está entregado o no
    if (cantidad_entregada !== null) {
      await db.query(`
        UPDATE remito_productos 
        SET entregado = ?, cantidad_entregada = ?
        WHERE remito_id = ? AND producto_id = ?
      `, [entregado ? 1 : 0, cantidad_entregada, remito_id, producto_id]);
      
      console.log(`[DEBUG SQL] UPDATE remito_productos SET entregado=${entregado ? 1 : 0}, cantidad_entregada=${cantidad_entregada} WHERE remito_id=${remito_id} AND producto_id=${producto_id}`);
    } else {
      await db.query(`
        UPDATE remito_productos 
        SET entregado = ?
        WHERE remito_id = ? AND producto_id = ?
      `, [entregado ? 1 : 0, remito_id, producto_id]);
      
      console.log(`[DEBUG SQL] UPDATE remito_productos SET entregado=${entregado ? 1 : 0} WHERE remito_id=${remito_id} AND producto_id=${producto_id}`);
    }
  },

  async deleteByRemito(remito_id) {
    await db.query('DELETE FROM remito_productos WHERE remito_id = ?', [remito_id]);
  },

  // Nuevo método para actualizar directamente un registro por su ID
  async actualizarEntrega(id, cantidad_entregada, entregado) {
    try {
      await db.query(`
        UPDATE remito_productos 
        SET entregado = ?, cantidad_entregada = ?
        WHERE id = ?
      `, [entregado, cantidad_entregada, id]);
      
      console.log(`[DEBUG SQL] UPDATE remito_productos SET entregado=${entregado}, cantidad_entregada=${cantidad_entregada} WHERE id=${id}`);
      return true;
    } catch (error) {
      console.error('[ERROR SQL] Error al actualizar remito_productos:', error);
      throw error;
    }
  }
};

module.exports = RemitoProducto;
