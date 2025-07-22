// models/Entrega.js
const db = require('../config/db');

const Entrega = {
  async getAll() {
    const [rows] = await db.query(`
      SELECT e.*, r.numero_remito, c.nombre AS cliente, u.nombre AS operario, 
             e.entrega_parcial
      FROM entregas e
      JOIN remitos r ON e.remito_id = r.id
      JOIN clientes c ON r.cliente_id = c.id
      JOIN usuarios u ON e.operario_id = u.id
      ORDER BY e.fecha_entrega DESC
    `);
    return rows;
  },

  async getByRemitoId(remito_id) {
    // Asegurarnos de seleccionar explícitamente entrega_parcial para evitar problemas de tipo de datos
    const [rows] = await db.query(
      'SELECT id, remito_id, operario_id, fecha_entrega, nombre_operario, entrega_parcial FROM entregas WHERE remito_id = ?', 
      [remito_id]
    );
    return rows[0];
  },

  async create({ remito_id, operario_id, nombre_operario, entrega_parcial = false }) {
    // Eliminar entrega anterior si existe
    await db.query('DELETE FROM entregas WHERE remito_id = ?', [remito_id]);
    
    // Asegurarnos de que entrega_parcial sea booleano y luego convertirlo a 0 o 1 para MySQL
    const esParcial = Boolean(entrega_parcial) ? 1 : 0;
    console.log(`[DEBUG] Modelo Entrega.create: insertando con entrega_parcial=${esParcial}`);
    
    const [result] = await db.query(
      'INSERT INTO entregas (remito_id, operario_id, nombre_operario, entrega_parcial) VALUES (?, ?, ?, ?)',
      [remito_id, operario_id, nombre_operario, esParcial]
    );
    return result.insertId;
  }
};

module.exports = Entrega;
