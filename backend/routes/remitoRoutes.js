// routes/remitoRoutes.js
const express = require('express');
const router = express.Router();
const remitoController = require('../controllers/remitoController');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');
const upload = multer(); // memoria (no guarda en disco)
const { cargarPDF } = require('../controllers/remitoController');


router.get('/', authMiddleware, remitoController.getAll);
router.get('/:id', authMiddleware, remitoController.getById);
router.get('/:id/detalle', authMiddleware, remitoController.getConDetalle);
router.get('/:id/operarios', remitoController.getOperarios);
router.post('/', authMiddleware, remitoController.create);
router.post('/:id/generar-qr', authMiddleware, remitoController.generarQR);
router.post('/cargar-pdf', upload.single('archivo'), cargarPDF);
// Nueva ruta para parsear PDF de remito
router.post('/parse-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se subió ningún archivo' });
    const resultado = await require('../utils/pdfParser')(req.file.buffer);
    res.json(resultado);
  } catch (err) {
    res.status(500).json({ error: 'Error al procesar el PDF' });
  }
});
// Ruta pública para validar QR y registrar entrega (API para React)
router.get('/validar/:token', async (req, res) => {
  const { token } = req.params;
  const TokenAcceso = require('../models/TokenAcceso');
  const Remito = require('../models/Remito');
  console.log('Validando token:', token);
  const tokenRow = await TokenAcceso.getByToken(token);
  if (!tokenRow) {
    console.log('Token no encontrado, expirado o ya usado');
    return res.status(404).json({ error: 'Token inválido o expirado' });
  }
  console.log('Token encontrado:', tokenRow);
  const remito = await Remito.getWithDetalle(tokenRow.remito_id);
  if (!remito) {
    console.log('Remito no encontrado para remito_id:', tokenRow.remito_id);
    return res.status(404).json({ error: 'Remito no encontrado' });
  }
  console.log('Remito encontrado:', remito);
  res.json(remito);
});

// Endpoint para registrar entrega
router.post('/registrar-entrega', async (req, res) => {
  const { token, operario_id, nombre_operario, productos } = req.body;
  const TokenAcceso = require('../models/TokenAcceso');
  const RemitoProducto = require('../models/RemitoProducto');
  const Remito = require('../models/Remito');
  const Entrega = require('../models/Entrega');
  const tokenRow = await TokenAcceso.getByToken(token);
  if (!tokenRow) return res.status(400).json({ error: 'Token inválido o expirado' });
  const remito_id = tokenRow.remito_id;
  // Marcar productos como entregados
  for (let producto of productos) {
    await RemitoProducto.marcarEntregado(remito_id, producto.producto_id);
  }
  // Registrar entrega en la tabla entregas
  await Entrega.create({ remito_id, operario_id, nombre_operario });
  // Actualizar estado del remito a 'entregado'
  await Remito.updateEstado(remito_id, 'entregado');
  res.json({ mensaje: 'Entrega registrada correctamente.' });
});

router.put('/:id', authMiddleware, remitoController.updatePendiente);

module.exports = router;
