const bcrypt = require('bcrypt');
const Usuario = require('../models/Usuario');

const authController = {
  async login(req, res) {
    const { email, contraseña } = req.body;
    

    const usuario = await Usuario.getByEmail(email);
    

    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    const esValido = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!esValido) return res.status(401).json({ error: 'Contraseña incorrecta' });

    req.session.user = {
      id: usuario.id,
      rol: usuario.rol,
      nombre: usuario.nombre
    };

    res.json({ mensaje: 'Login exitoso', usuario: req.session.user });
  },

  logout(req, res) {
    req.session.destroy();
    res.json({ mensaje: 'Sesión cerrada' });
  },

  async registrar(req, res) {
    try {
      const { nombre, email, password, rol } = req.body;
      if (!nombre || !email || !password) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
      }
      const hash = await bcrypt.hash(password, 10);
      const id = await Usuario.create({ nombre, email, contraseña: hash, rol });
      res.status(201).json({ mensaje: 'Usuario creado', id });
    } catch (err) {
      
      res.status(500).json({ error: 'Error al registrar usuario' });
    }
  },

  async getByRol(req, res) {
    try {
      const { rol } = req.query;
      const usuarios = await Usuario.getByRol(rol);
      res.json(usuarios);
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener usuarios por rol' });
    }
  }
};

module.exports = authController;
