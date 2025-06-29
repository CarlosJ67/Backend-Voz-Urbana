const express = require('express');
const router = express.Router();
const comentariosController = require('../controllers/comentarioController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Comentarios
 *   description: Gestión de comentarios en reportes
 */

/**
 * @swagger
 * /api/comentarios:
 *   post:
 *     summary: Crear un comentario en un reporte
 *     tags: [Comentarios]
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
 *                 example: 10
 *               texto:
 *                 type: string
 *                 example: Estoy de acuerdo, este problema afecta a muchos vecinos.
 *     responses:
 *       201:
 *         description: Comentario creado exitosamente
 *       401:
 *         description: Token no proporcionado o inválido
 */
router.post('/', auth, comentariosController.createComentario);

/**
 * @swagger
 * /api/comentarios/{reporte_id}:
 *   get:
 *     summary: Obtener comentarios de un reporte
 *     tags: [Comentarios]
 *     parameters:
 *       - in: path
 *         name: reporte_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del reporte
 *     responses:
 *       200:
 *         description: Lista de comentarios del reporte
 */
router.get('/:reporte_id', comentariosController.getComentariosByReporte);

module.exports = router;