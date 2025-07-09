// routes/entregaRoutes.js
const express = require('express');
const router = express.Router();
const entregaController = require('../controllers/entregaController');
const authMiddleware = require('../middlewares/authMiddleware');

// Acceso sin autenticación por QR
router.get('/validar', entregaController.validarQR);
router.post('/confirmar', entregaController.confirmarEntrega);

// Vista interna protegida
router.get('/', authMiddleware, entregaController.getAll);

// Reporte de entregas
router.get('/reporte', entregaController.reporteEntregas);

module.exports = router;
