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


/**
 * @swagger
 * /api/comentarios/{id}:
 *   patch:
 *     summary: Actualizar un comentario
 *     tags: [Comentarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del comentario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               texto:
 *                 type: string
 *                 example: He actualizado mi opinión después de hablar con los vecinos.
 *     responses:
 *       200:
 *         description: Comentario actualizado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Comentario no encontrado
 */
router.patch('/:id', auth, comentariosController.updateComentario);

/**
 * @swagger
 * /api/comentarios/{id}:
 *   delete:
 *     summary: Eliminar un comentario
 *     tags: [Comentarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del comentario
 *     responses:
 *       200:
 *         description: Comentario eliminado correctamente
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Comentario no encontrado
 */
router.delete('/:id', auth, comentariosController.deleteComentario);

module.exports = router;