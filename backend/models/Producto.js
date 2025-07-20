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

  async create({ codigo_bit, codigo_barra, nombre, unidad_medida }) {
    // Si el código de barras está definido, verificamos si ya existe
    if (codigo_barra) {
      const existingProduct = await this.getByCodigoBarra(codigo_barra);
      if (existingProduct) {
        // Si ya existe, retornamos ese id en lugar de crear uno nuevo
        return existingProduct.id;
      }
    }
    
    // Si no existe o no tiene código de barras, lo creamos
    const [result] = await db.query(
      'INSERT INTO productos (codigo_bit, codigo_barra, nombre, unidad_medida) VALUES (?, ?, ?, ?)',
      [codigo_bit, codigo_barra || null, nombre, unidad_medida]
    );
    return result.insertId;
  },

  async update(id, { codigo_bit, codigo_barra, nombre, unidad_medida }) {
    await db.query(
      'UPDATE productos SET codigo_bit = ?, codigo_barra = ?, nombre = ?, unidad_medida = ? WHERE id = ?',
      [codigo_bit, codigo_barra, nombre, unidad_medida, id]
    );
  },

  async delete(id) {
    await db.query('DELETE FROM productos WHERE id = ?', [id]);
  },

  async getByCodigoBarra(codigo_barra) {
    const [rows] = await db.query('SELECT * FROM productos WHERE codigo_barra = ?', [codigo_barra]);
    return rows[0];
  }
};

module.exports = Producto;
