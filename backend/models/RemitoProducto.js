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
      SELECT rp.*, p.nombre, p.codigo_bit, p.unidad_medida
      FROM remito_productos rp
      JOIN productos p ON rp.producto_id = p.id
      WHERE rp.remito_id = ?
    `, [remito_id]);
    return rows;
  },

  async marcarEntregado(remito_id, producto_id) {
    await db.query(`
      UPDATE remito_productos SET entregado = 1
      WHERE remito_id = ? AND producto_id = ?
    `, [remito_id, producto_id]);
  },

  async deleteByRemito(remito_id) {
    await db.query('DELETE FROM remito_productos WHERE remito_id = ?', [remito_id]);
  }
};

module.exports = RemitoProducto;
