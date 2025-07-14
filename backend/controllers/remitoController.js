const Remito = require('../models/Remito');
const RemitoProducto = require('../models/RemitoProducto');
const TokenAcceso = require('../models/TokenAcceso');
const generarTokenQR = require('../utils/generarTokenQR');
const dayjs = require('dayjs');
const parsearRemitoPDF = require('../utils/pdfParser');

const remitoController = {
  async getAll(req, res) {
    const remitos = await Remito.getAll();
    res.json(remitos);
  },

  async getById(req, res) {
    const remito = await Remito.getById(req.params.id);
    if (!remito) return res.status(404).json({ error: 'Remito no encontrado' });
    res.json(remito);
  },

  async getConDetalle(req, res) {
    const remito = await Remito.getWithDetalle(req.params.id);
    if (!remito) return res.status(404).json({ error: 'Remito no encontrado' });
    res.json(remito);
  },

  async create(req, res) {
    const { remito, productos, operarioIds } = req.body;
    // Crear remito y asociar operarios
    const idRemito = await Remito.createWithOperarios(remito, operarioIds);
    await RemitoProducto.insertBatch(idRemito, productos);

    // Generar token QR y guardar en tokens_acceso
    const token = generarTokenQR();
    const expiracion = dayjs().add(7, 'day').format('YYYY-MM-DD HH:mm:ss'); // 7 días de validez
    await TokenAcceso.generar(idRemito, token, expiracion);
    const urlQR = `http://localhost:5173/validar?token=${token}`;

    res.status(201).json({ id: idRemito, token, urlQR });
  },

  async generarQR(req, res) {
    const remito_id = req.params.id;
    const token = generarTokenQR();
    const expiracion = dayjs().add(1, 'day').format('YYYY-MM-DD HH:mm:ss');

    await TokenAcceso.generar(remito_id, token, expiracion);

    const urlQR = `http://localhost:5173/validar?token=${token}`;
    res.json({ token, urlQR });
  },

  // ✅ Nuevo controlador: cargar PDF y extraer datos
  async cargarPDF(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No se subió ningún archivo' });
      }

      console.log('Archivo recibido:', req.file.originalname);
      console.log('Tamaño:', req.file.size);
      console.log('Tipo:', req.file.mimetype);

      const resultado = await parsearRemitoPDF(req.file.buffer);
      res.json({ datos: resultado });
    } catch (error) {
      console.error('Error al procesar el PDF:', error.message);
      console.error(error.stack);
      res.status(500).json({ error: 'Error al procesar el archivo PDF' });
    }
  },

  async getOperarios(req, res) {
    const remitoId = req.params.id;
    // Operarios asignados
    const asignados = await Remito.getOperarios(remitoId);
    // Todos los operarios disponibles
    const Usuario = require('../models/Usuario');
    const todos = await Usuario.getByRol('operario');
    res.json({
      todos,
      asignados: asignados.map(o => o.id)
    });
  },

  async updatePendiente(req, res) {
    try {
      const remitoId = req.params.id;
      const { productos, operarioIds } = req.body;
      // Actualizar productos
      await RemitoProducto.deleteByRemito(remitoId);
      await RemitoProducto.insertBatch(remitoId, productos);
      // Actualizar operarios
      await Remito.updateOperarios(remitoId, operarioIds);
      res.json({ mensaje: 'Remito actualizado correctamente.' });
    } catch (err) {
      res.status(500).json({ error: 'Error al actualizar el remito.' });
    }
  }
};

module.exports = remitoController;
