const express = require('express');
const router = express.Router();
const categoriasController = require('../controllers/CategoriasController');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

/**
 * @swagger
 * tags:
 *   name: Categorias
 *   description: Gestión de categorías
 */

/**
 * @swagger
 * /api/categorias:
 *   get:
 *     summary: Obtener todas las categorías activas
 *     tags: [Categorias]
 *     responses:
 *       200:
 *         description: Lista de categorías
 */
router.get('/', categoriasController.getCategorias);

/**
 * @swagger
 * /api/categorias:
 *   post:
 *     summary: Crear una nueva categoría
 *     tags: [Categorias]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Seguridad
 *               icono:
 *                 type: string
 *                 example: seguridad.png
 *               descripcion:
 *                 type: string
 *                 example: Reportes de seguridad pública
 *               activa:
 *                 type: boolean
 *                 example: true
 *               orden_visualizacion:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Categoría creada exitosamente
 *       403:
 *         description: Acceso solo para administradores
 */
router.post('/', auth, isAdmin, categoriasController.createCategoria);

/**
 * @swagger
 * /api/categorias/{id}:
 *   put:
 *     summary: Actualizar una categoría
 *     tags: [Categorias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la categoría
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               icono:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               activa:
 *                 type: boolean
 *               orden_visualizacion:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Categoría actualizada exitosamente
 *       403:
 *         description: Acceso solo para administradores
 *       404:
 *         description: Categoría no encontrada
 */
router.put('/:id', auth, isAdmin, categoriasController.updateCategoria);

/**
 * @swagger
 * /api/categorias/{id}:
 *   delete:
 *     summary: Eliminar (desactivar) una categoría
 *     tags: [Categorias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la categoría
 *     responses:
 *       200:
 *         description: Categoría desactivada
 *       403:
 *         description: Acceso solo para administradores
 *       404:
 *         description: Categoría no encontrada
 */
router.delete('/:id', auth, isAdmin, categoriasController.deleteCategoria);

module.exports = router;