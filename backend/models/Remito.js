// models/Remito.js
const db = require('../config/db');

const Remito = {
  async getAll() {
    const [rows] = await db.query(`
      SELECT r.*, c.nombre AS cliente_nombre
      FROM remitos r
      JOIN clientes c ON r.cliente_id = c.id
      ORDER BY r.fecha_emision DESC
    `);
    return rows;
  },

  async getById(id) {
    const [rows] = await db.query(`
      SELECT r.*, c.nombre AS cliente_nombre
      FROM remitos r
      JOIN clientes c ON r.cliente_id = c.id
      WHERE r.id = ?
    `, [id]);
    return rows[0];
  },

  async getWithDetalle(id) {
    const [remito] = await db.query(`
      SELECT r.*, c.nombre AS cliente_nombre, c.cuit, c.domicilio, c.localidad
      FROM remitos r
      JOIN clientes c ON r.cliente_id = c.id
      WHERE r.id = ?
    `, [id]);

    const [productos] = await db.query(`
      SELECT rp.*, p.nombre, p.codigo_bit, p.unidad_medida
      FROM remito_productos rp
      JOIN productos p ON rp.producto_id = p.id
      WHERE rp.remito_id = ?
    `, [id]);

    return { ...remito[0], productos };
  },

  async create(data) {
    const {
      numero_remito, cliente_id, fecha_emision,
      condicion_operacion, observaciones, archivo_pdf
    } = data;

    const [result] = await db.query(`
      INSERT INTO remitos
        (numero_remito, cliente_id, fecha_emision, condicion_operacion, observaciones, archivo_pdf)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [numero_remito, cliente_id, fecha_emision, condicion_operacion, observaciones, archivo_pdf]);

    return result.insertId;
  },

  async createWithOperarios(data, operarioIds) {
    // Crea el remito y asocia los operarios
    const remitoId = await this.create(data);
    if (Array.isArray(operarioIds) && operarioIds.length > 0) {
      for (const operarioId of operarioIds) {
        await db.query(
          'INSERT INTO remito_operarios (remito_id, operario_id) VALUES (?, ?)',
          [remitoId, operarioId]
        );
      }
    }
    return remitoId;
  },

  async getOperarios(remitoId) {
    const [rows] = await db.query(
      'SELECT u.id, u.nombre FROM remito_operarios ro JOIN usuarios u ON ro.operario_id = u.id WHERE ro.remito_id = ?',
      [remitoId]
    );
    return rows;
  }
};

module.exports = Remito;
