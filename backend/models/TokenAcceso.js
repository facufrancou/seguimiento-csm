// models/TokenAcceso.js
const db = require('../config/db');

const TokenAcceso = {
  async generar(remito_id, token, expiracion) {
    const [result] = await db.query(`
      INSERT INTO tokens_acceso (remito_id, token, expiracion)
      VALUES (?, ?, ?)
    `, [remito_id, token, expiracion]);
    return result.insertId;
  },

  async getByToken(token) {
    const [rows] = await db.query(`
      SELECT * FROM tokens_acceso
      WHERE token = ? AND usado = 0 AND expiracion > NOW()
    `, [token]);
    return rows[0];
  },

  async marcarUsado(token) {
    await db.query(`
      UPDATE tokens_acceso SET usado = 1 WHERE token = ?
    `, [token]);
  }
};

module.exports = TokenAcceso;
