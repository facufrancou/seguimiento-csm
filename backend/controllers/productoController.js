// controllers/productoController.js
const Producto = require('../models/Producto');

const productoController = {
  async getAll(req, res) {
    const productos = await Producto.getAll();
    res.json(productos);
  },

  async getById(req, res) {
    const producto = await Producto.getById(req.params.id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(producto);
  },

  async create(req, res) {
    const id = await Producto.create(req.body);
    res.status(201).json({ id });
  },

  async update(req, res) {
    await Producto.update(req.params.id, req.body);
    res.json({ mensaje: 'Producto actualizado' });
  },

  async delete(req, res) {
    await Producto.delete(req.params.id);
    res.json({ mensaje: 'Producto eliminado' });
  }
};

module.exports = productoController;
