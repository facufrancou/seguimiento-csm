// controllers/clienteController.js
const Cliente = require('../models/Cliente');

const clienteController = {
  async getAll(req, res) {
    const clientes = await Cliente.getAll();
    res.json(clientes);
  },

  async getById(req, res) {
    const cliente = await Cliente.getById(req.params.id);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(cliente);
  },

  async create(req, res) {
    const id = await Cliente.create(req.body);
    res.status(201).json({ id });
  },

  async update(req, res) {
    await Cliente.update(req.params.id, req.body);
    res.json({ mensaje: 'Cliente actualizado' });
  },

  async delete(req, res) {
    await Cliente.delete(req.params.id);
    res.json({ mensaje: 'Cliente eliminado' });
  }
};

module.exports = clienteController;
