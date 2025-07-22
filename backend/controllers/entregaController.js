// controllers/entregaController.js
const TokenAcceso = require('../models/TokenAcceso');
const Remito = require('../models/Remito');
const RemitoProducto = require('../models/RemitoProducto');
const Entrega = require('../models/Entrega');
const Usuario = require('../models/Usuario');
const EntregaDetalle = require('../models/EntregaDetalle');
const Producto = require('../models/Producto');

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
      const entregas = await Entrega.getAll();
      
      // Debuggear el formato de entregas y asegurarse que entrega_parcial esté presente
      console.log('[DEBUG] Enviando reporte de entregas:');
      if (entregas.length > 0) {
        console.log(`[DEBUG] Primera entrega: entrega_parcial=${entregas[0].entrega_parcial}, tipo=${typeof entregas[0].entrega_parcial}`);
      }
      
      res.json(entregas);
    } catch (err) {
      console.error('[ERROR] Error al obtener reporte:', err);
      res.status(500).json({ error: 'Error al obtener el reporte de entregas' });
    }
  },

  // Detalle de productos entregados por remito con información de estado mejorada
  async detalleEntrega(req, res) {
    try {
      const remito_id = req.params.remito_id;
      const productos = await RemitoProducto.getByRemito(remito_id);
      
      // Añadir información más precisa sobre el estado de entrega
      const productosConEstado = productos.map(p => {
        const cantidadSolicitada = parseFloat(p.cantidad_solicitada || 0);
        const cantidadEntregada = parseFloat(p.cantidad_entregada || 0);
        
        // Determinar el estado con más precisión
        let estadoDetallado;
        if (p.entregado === 0 || cantidadEntregada === 0) {
          estadoDetallado = 'No entregado';
        } else if (Math.abs(cantidadEntregada - cantidadSolicitada) < 0.01) {
          estadoDetallado = 'Completo';
        } else if (cantidadEntregada < cantidadSolicitada) {
          estadoDetallado = 'Parcial';
        } else {
          estadoDetallado = 'Excedido';
        }
        
        return {
          ...p,
          estado_entrega: estadoDetallado,
          diferencia: (cantidadEntregada - cantidadSolicitada).toFixed(2)
        };
      });
      
      console.log('[DEBUG] Detalle de productos para remito_id:', remito_id);
      if (productosConEstado.length > 0) {
        console.log('[DEBUG] Primer producto con estado mejorado:', JSON.stringify(productosConEstado[0], null, 2));
      }
      
      res.json(productosConEstado);
    } catch (err) {
      console.error('[ERROR] Error al obtener detalle de productos:', err);
      res.status(500).json({ error: 'Error al obtener el detalle de productos' });
    }
  },

  async registrarProductoEscaneado(req, res) {
    const { entrega_id, codigo_barra } = req.body;

    // Validar que el producto existe
    const producto = await Producto.getByCodigoBarra(codigo_barra);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Registrar escaneo
    await EntregaDetalle.addProducto({
      entrega_id,
      producto_id: producto.id,
      codigo_barra
    });

    res.json({ mensaje: 'Producto registrado correctamente', producto });
  },

  async finalizarEntrega(req, res) {
    const { entrega_id } = req.body;

    // Obtener resumen de productos escaneados
    const productos = await EntregaDetalle.getByEntregaId(entrega_id);

    // Actualizar estado de la entrega
    await Entrega.updateEstado(entrega_id, 'finalizado');

    res.json({ mensaje: 'Entrega finalizada correctamente', resumen: productos });
  }
};

module.exports = entregaController;
