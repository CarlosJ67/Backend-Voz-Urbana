const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const authMiddleware = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Reportes
 *   description: Gestión de reportes ciudadanos
 */

/**
 * @swagger
 * /api/reports:
 *   post:
 *     summary: Crear un nuevo reporte
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *                 example: Bache peligroso en la avenida
 *               descripcion:
 *                 type: string
 *                 example: Hay un bache grande que puede causar accidentes.
 *               categoria_id:
 *                 type: integer
 *                 example: 2
 *               ubicacion:
 *                 type: string
 *                 example: Avenida Central esquina con Calle 5
 *               latitud:
 *                 type: number
 *                 example: 19.432608
 *               longitud:
 *                 type: number
 *                 example: -99.133209
 *               imagen_url:
 *                 type: string
 *                 example: https://ejemplo.com/imagen-bache.jpg
 *               prioridad:
 *                 type: string
 *                 enum: [baja, media, alta]
 *                 example: alta
 *     responses:
 *       201:
 *         description: Reporte creado exitosamente
 *       401:
 *         description: Token no proporcionado o inválido
 */
router.post('/', authMiddleware, reportsController.createReport);

/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: Obtener todos los reportes
 *     tags: [Reportes]
 *     responses:
 *       200:
 *         description: Lista de reportes
 */
router.get('/', reportsController.getAllReports);

/**
 * @swagger
 * /api/reports/location/{lat}/{lng}/{radius}:
 *   get:
 *     summary: Obtener reportes por ubicación aproximada
 *     tags: [Reportes]
 *     parameters:
 *       - in: path
 *         name: lat
 *         schema:
 *           type: number
 *         required: true
 *         description: Latitud central
 *       - in: path
 *         name: lng
 *         schema:
 *           type: number
 *         required: true
 *         description: Longitud central
 *       - in: path
 *         name: radius
 *         schema:
 *           type: number
 *         required: true
 *         description: Radio de búsqueda (grados)
 *     responses:
 *       200:
 *         description: Lista de reportes cercanos
 */
router.get('/location/:lat/:lng/:radius', reportsController.getReportsByLocation);

module.exports = router;