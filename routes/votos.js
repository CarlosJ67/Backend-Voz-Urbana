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
 * /api/votos/up:
 *   post:
 *     summary: Votar positivamente un reporte (upvote)
 *     tags: [Votos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reporte_id
 *             properties:
 *               reporte_id:
 *                 type: integer
 *                 example: 10
 *     responses:
 *       201:
 *         description: Voto up registrado
 *       200:
 *         description: Voto cambiado o eliminado (none)
 *       500:
 *         description: Error del servidor al votar
 */
router.post('/up', auth, votosController.votarUp);

/**
 * @swagger
 * /api/votos/down:
 *   post:
 *     summary: Votar negativamente un reporte (downvote)
 *     tags: [Votos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reporte_id
 *             properties:
 *               reporte_id:
 *                 type: integer
 *                 example: 10
 *     responses:
 *       201:
 *         description: Voto down registrado
 *       200:
 *         description: Voto cambiado o eliminado (none)
 *       500:
 *         description: Error del servidor al votar
 */
router.post('/down', auth, votosController.votarDown);



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