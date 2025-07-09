// routes/productoRoutes.js
const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, productoController.getAll);
router.get('/:id', authMiddleware, productoController.getById);
router.post('/', authMiddleware, productoController.create);
router.put('/:id', authMiddleware, productoController.update);
router.delete('/:id', authMiddleware, productoController.delete);

module.exports = router;
