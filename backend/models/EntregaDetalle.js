const db = require('../config/db');

const EntregaDetalle = {
  async getByEntregaId(entregaId) {
    const [rows] = await db.query('SELECT * FROM entrega_detalle WHERE entrega_id = ?', [entregaId]);
    return rows;
  },

  async addProducto({ entrega_id, producto_id, codigo_barra }) {
    const [result] = await db.query(
      'INSERT INTO entrega_detalle (entrega_id, producto_id, codigo_barra) VALUES (?, ?, ?)',
      [entrega_id, producto_id, codigo_barra]
    );
    return result.insertId;
  },

  async deleteByEntregaId(entregaId) {
    await db.query('DELETE FROM entrega_detalle WHERE entrega_id = ?', [entregaId]);
  }
};

module.exports = EntregaDetalle;
