const express = require('express');
const router = express.Router();
const votosController = require('../controllers/votosController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Votos
 *   description: Votación de reportes ciudadanos
 */

/**
 * @swagger
 * /api/votos:
 *   post:
 *     summary: Votar por un reporte
 *     tags: [Votos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reporte_id:
 *                 type: integer
 *                 example: 15
 *               tipo_voto:
 *                 type: string
 *                 enum: [up, down]
 *                 example: up
 *     responses:
 *       201:
 *         description: Voto registrado
 *       200:
 *         description: Voto actualizado
 *       401:
 *         description: Token no proporcionado o inválido
 */
router.post('/', auth, votosController.votar);

/**
 * @swagger
 * /api/votos/{reporte_id}:
 *   get:
 *     summary: Obtener votos de un reporte
 *     tags: [Votos]
 *     parameters:
 *       - in: path
 *         name: reporte_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del reporte
 *     responses:
 *       200:
 *         description: Conteo de votos del reporte
 */
router.get('/:reporte_id', votosController.getVotosPorReporte);

module.exports = router;