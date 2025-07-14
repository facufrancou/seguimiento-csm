// models/Entrega.js
const db = require('../config/db');

const Entrega = {
  async getAll() {
    const [rows] = await db.query(`
      SELECT e.*, r.numero_remito, c.nombre AS cliente, u.nombre AS operario
      FROM entregas e
      JOIN remitos r ON e.remito_id = r.id
      JOIN clientes c ON r.cliente_id = c.id
      JOIN usuarios u ON e.operario_id = u.id
      ORDER BY e.fecha_entrega DESC
    `);
    return rows;
  },

  async getByRemitoId(remito_id) {
    const [rows] = await db.query('SELECT * FROM entregas WHERE remito_id = ?', [remito_id]);
    return rows[0];
  },

  async create({ remito_id, operario_id, nombre_operario }) {
    // Eliminar entrega anterior si existe
    await db.query('DELETE FROM entregas WHERE remito_id = ?', [remito_id]);
    const [result] = await db.query(
      'INSERT INTO entregas (remito_id, operario_id, nombre_operario) VALUES (?, ?, ?)',
      [remito_id, operario_id, nombre_operario]
    );
    return result.insertId;
  }
};

module.exports = Entrega;
