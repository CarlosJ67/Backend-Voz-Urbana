const express = require('express');
const router = express.Router();
const votosController = require('../controllers/votosController');
const auth = require('../middleware/auth');

// Votar (requiere login)
router.post('/', auth, votosController.votar);

// Obtener votos de un reporte
router.get('/:reporte_id', votosController.getVotosPorReporte);

module.exports = router;