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
  const { token, operario_id, nombre_operario, productos, entrega_parcial = false } = req.body;
  const TokenAcceso = require('../models/TokenAcceso');
  const RemitoProducto = require('../models/RemitoProducto');
  const Remito = require('../models/Remito');
  const Entrega = require('../models/Entrega');
  
  console.log(`[DEBUG] Recibiendo solicitud de entrega, parcial=${entrega_parcial}`);
  
  const tokenRow = await TokenAcceso.getByToken(token);
  if (!tokenRow) return res.status(400).json({ error: 'Token inválido o expirado' });
  const remito_id = tokenRow.remito_id;
  
  // Primero obtenemos todos los productos del remito
  const todosProductos = await RemitoProducto.getByRemito(remito_id);
  console.log('[DEBUG] Todos los productos del remito:', todosProductos.map(p => p.id));
  console.log('[DEBUG] Productos recibidos para entregar:', productos);
  
  // Crear mapas para los productos
  const productosEntregadosMap = {};
  const productosRemito = {};
  
  // Para depurar, imprimimos más información
  console.log('[DEBUG] Productos recibidos detalle:');
  productos.forEach(p => {
    console.log(`  - producto_id: ${p.producto_id}, cantidad: ${p.cantidad}`);
    // En el frontend se está enviando el id del registro de remito_productos como producto_id
    productosEntregadosMap[p.producto_id] = p.cantidad;
  });
  
  // Creamos un mapa de los productos del remito por ID para acceso rápido
  todosProductos.forEach(p => {
    productosRemito[p.id] = p;
    console.log(`  - id: ${p.id}, producto_id: ${p.producto_id}, nombre: ${p.nombre}`);
  });
  
  // Ahora procesamos solo los productos que vienen en la solicitud
  console.log('[DEBUG] Procesando productos por ID de registro:');
  
  // Primero marcamos todos como no entregados con cantidad 0
  for (let producto of todosProductos) {
    try {
      await RemitoProducto.actualizarEntrega(
        producto.id,
        0,  // cantidad_entregada = 0
        0   // entregado = 0 (no entregado)
      );
      console.log(`[DEBUG] Producto ${producto.id} (${producto.nombre}) inicializado como no entregado`);
    } catch (error) {
      console.error(`[ERROR] Error al inicializar producto ${producto.id}:`, error);
    }
  }
  
  // Luego actualizamos solo los productos que fueron entregados
  for (const [idRegistro, cantidad] of Object.entries(productosEntregadosMap)) {
    const idNumerico = parseInt(idRegistro);
    const fueEntregado = cantidad > 0;
    
    // Marcar como entregado y registrar la cantidad entregada (0 si no fue entregado)
    if (productosRemito[idNumerico]) {
      try {
        console.log(`[DEBUG] Actualizando producto entregado: registro ID=${idNumerico}, cantidad=${cantidad}`);
        
        await RemitoProducto.actualizarEntrega(
          idNumerico,  // ID del registro en remito_productos
          cantidad,    // Cantidad entregada
          1            // entregado = 1 (sí entregado)
        );
        
        console.log(`[DEBUG] Producto con ID de registro ${idNumerico} actualizado como entregado con cantidad ${cantidad}`);
      } catch (error) {
        console.error(`[ERROR] Error al actualizar producto ${idNumerico}:`, error);
      }
    } else {
      console.warn(`[WARN] Producto con ID ${idNumerico} no encontrado en el remito`);
    }
  }
  
  // Registrar entrega en la tabla entregas
  // Convertimos a booleano y luego a 0/1 para asegurarnos
  const esParcial = Boolean(entrega_parcial);
  console.log(`[DEBUG] Guardando entrega como parcial=${esParcial}`);
  
  await Entrega.create({ 
    remito_id, 
    operario_id, 
    nombre_operario, 
    entrega_parcial: esParcial 
  });
  
  // Actualizar estado del remito según si es parcial o completa
  const estado = esParcial ? 'parcial' : 'entregado';
  console.log(`[DEBUG] Actualizando estado del remito a "${estado}"`);
  await Remito.updateEstado(remito_id, estado);
  
  // Verificar que la entrega se guardó correctamente
  const entregaGuardada = await Entrega.getByRemitoId(remito_id);
  console.log('[DEBUG] Entrega guardada:', entregaGuardada);
  res.json({ mensaje: `Entrega ${entrega_parcial ? 'parcial' : 'completa'} registrada correctamente.` });
});

router.put('/:id', authMiddleware, remitoController.updatePendiente);

module.exports = router;
