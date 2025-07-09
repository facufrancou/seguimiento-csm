// controllers/entregaController.js
const TokenAcceso = require('../models/TokenAcceso');
const Remito = require('../models/Remito');
const RemitoProducto = require('../models/RemitoProducto');
const Entrega = require('../models/Entrega');
const Usuario = require('../models/Usuario');

const entregaController = {
  // Validar token y traer info de remito y productos (modo solo lectura para QR)
  async validarQR(req, res) {
    const { token } = req.query;
    const data = await TokenAcceso.getByToken(token);
    if (!data) return res.status(403).json({ error: 'Token inválido o expirado' });

    const remito = await Remito.getWithDetalle(data.remito_id);
    res.json(remito);
  },

  // Confirmar entrega desde QR
  async confirmarEntrega(req, res) {
    const { token } = req.body;
    const { nombre_operario, productos_entregados } = req.body;

    const tokenData = await TokenAcceso.getByToken(token);
    if (!tokenData) return res.status(403).json({ error: 'Token inválido o expirado' });

    const remito_id = tokenData.remito_id;

    // Crear usuario operario si no existe (modo QR)
    let operario = await Usuario.getByEmail(`qr_${nombre_operario}@qr.com`);
    if (!operario) {
      const bcrypt = require('bcrypt');
      const contraseña = await bcrypt.hash('temporal', 10);
      const id = await Usuario.create({
        nombre: nombre_operario,
        email: `qr_${nombre_operario}@qr.com`,
        contraseña,
        rol: 'operario'
      });
      operario = await Usuario.getById(id);
    }

    // Registrar entrega
    await Entrega.create({
      remito_id,
      operario_id: operario.id,
      nombre_operario
    });

    // Marcar productos como entregados
    for (const prod of productos_entregados) {
      await RemitoProducto.marcarEntregado(remito_id, prod.producto_id);
    }

    // Cambiar estado del remito
    await Remito.updateEstado(remito_id, 'entregado');

    // Marcar token como usado
    await TokenAcceso.marcarUsado(token);

    res.json({ mensaje: 'Entrega confirmada correctamente' });
  },

  // Para reportes
  async getAll(req, res) {
    const entregas = await Entrega.getAll();
    res.json(entregas);
  },

  async reporteEntregas(req, res) {
    try {
      // Aquí deberías armar la consulta real para el reporte
      // Por ahora, devuelvo un array vacío de ejemplo
      res.json([]);
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener el reporte de entregas' });
    }
  }
};

module.exports = entregaController;
