const express = require('express');
const router = express.Router();
const categoriasController = require('../controllers/CategoriasController');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

// Público: obtener categorías activas
router.get('/', categoriasController.getCategorias);

// Solo admin: crear, actualizar, eliminar
router.post('/', auth, isAdmin, categoriasController.createCategoria);
router.put('/:id', auth, isAdmin, categoriasController.updateCategoria);
router.delete('/:id', auth, isAdmin, categoriasController.deleteCategoria);

module.exports = router;