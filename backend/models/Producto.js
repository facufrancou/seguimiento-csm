// models/Producto.js
const db = require('../config/db');

const Producto = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM productos');
    return rows;
  },

  async getById(id) {
    const [rows] = await db.query('SELECT * FROM productos WHERE id = ?', [id]);
    return rows[0];
  },

  async create({ codigo_bit, nombre, unidad_medida }) {
    const [result] = await db.query(
      'INSERT INTO productos (codigo_bit, nombre, unidad_medida) VALUES (?, ?, ?)',
      [codigo_bit, nombre, unidad_medida]
    );
    return result.insertId;
  },

  async update(id, { codigo_bit, nombre, unidad_medida }) {
    await db.query(
      'UPDATE productos SET codigo_bit = ?, nombre = ?, unidad_medida = ? WHERE id = ?',
      [codigo_bit, nombre, unidad_medida, id]
    );
  },

  async delete(id) {
    await db.query('DELETE FROM productos WHERE id = ?', [id]);
  }
};

module.exports = Producto;
