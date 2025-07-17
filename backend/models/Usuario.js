const db = require("../config/db");

const Usuario = {
  async getByEmail(email) {
    
    const [rows] = await db.query("SELECT * FROM usuarios WHERE email = ?", [email]);
    return rows[0];
  },

  async getById(id) {
    const [rows] = await db.query("SELECT * FROM usuarios WHERE id = ?", [id]);
    return rows[0];
  },

  async create({ nombre, email, contraseña, rol }) {
    const [result] = await db.query(
      "INSERT INTO usuarios (nombre, email, contraseña, rol) VALUES (?, ?, ?, ?)",
      [nombre, email, contraseña, rol || "operario"]
    );
    return result.insertId;
  },

  async getByRol(rol) {
    const [rows] = await db.query("SELECT * FROM usuarios WHERE rol = ?", [rol]);
    return rows;
  },

  async getAll() {
    const [rows] = await db.query("SELECT * FROM usuarios");
    return rows;
  },
};

module.exports = Usuario;
