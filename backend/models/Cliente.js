// models/Cliente.js
const db = require('../config/db');

const Cliente = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM clientes');
    return rows;
  },

  async getById(id) {
    const [rows] = await db.query('SELECT * FROM clientes WHERE id = ?', [id]);
    return rows[0];
  },

  async create(cliente) {
    const { nombre, cuit, domicilio, localidad, condicion_iva } = cliente;
    const [result] = await db.query(
      'INSERT INTO clientes (nombre, cuit, domicilio, localidad, condicion_iva) VALUES (?, ?, ?, ?, ?)',
      [nombre, cuit, domicilio, localidad, condicion_iva]
    );
    return result.insertId;
  },

  async update(id, cliente) {
    const { nombre, cuit, domicilio, localidad, condicion_iva } = cliente;
    await db.query(
      'UPDATE clientes SET nombre = ?, cuit = ?, domicilio = ?, localidad = ?, condicion_iva = ? WHERE id = ?',
      [nombre, cuit, domicilio, localidad, condicion_iva, id]
    );
  },

  async delete(id) {
    await db.query('DELETE FROM clientes WHERE id = ?', [id]);
  }
};

module.exports = Cliente;
