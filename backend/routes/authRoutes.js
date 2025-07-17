// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const Usuario = require('../models/Usuario'); // <-- Asegura que esté presente
const roleMiddleware = require('../middlewares/roleMiddleware');

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/registrar', authController.registrar);
router.post('/debug', (req, res) => {
  
  res.json({ recibido: req.body });
});

router.get('/', async (req, res) => {
  try {
    const { rol } = req.query;
    let usuarios;
    if (rol) {
      usuarios = await Usuario.getByRol(rol);
    } else {
      usuarios = await Usuario.getAll();
    }
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

router.get('/usuarios', roleMiddleware(['admin']), async (req, res) => {
  try {
    const usuarios = await Usuario.getAll();
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

module.exports = router;
