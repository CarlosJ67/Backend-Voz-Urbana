const express = require('express');
const router = express.Router();
const comentariosController = require('../controllers/comentarioController');
const auth = require('../middleware/auth');

// Crear comentario (requiere login)
router.post('/', auth, comentariosController.createComentario);

// Obtener comentarios de un reporte
router.get('/:reporte_id', comentariosController.getComentariosByReporte);

module.exports = router;