const express = require('express');
const router = express.Router();
const utilsController = require('../controllers/utilsUsuariosController');
const utilsReportesController = require('../controllers/utilsReportesController');
const utilsComentariosController = require('../controllers/utilsComentariosController');
/**
 * @swagger
 * /api/utils/generar-usuarios-lote:
 *   post:
 *     summary: Genera usuarios aleatorios por lote (solo para pruebas)
 *     tags: [Utils]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               totalAdmins:
 *                 type: integer
 *                 example: 2
 *               totalCiudadanos:
 *                 type: integer
 *                 example: 2000
 *     responses:
 *       200:
 *         description: Usuarios generados exitosamente
 */
router.post('/generar-usuarios-lote', utilsController.generarUsuariosLote);

/**
 * @swagger
 * /api/utils/generar-reportes-lote:
 *   post:
 *     summary: Genera reportes aleatorios por lote (solo para pruebas)
 *     tags: [Utils]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               totalReportes:
 *                 type: integer
 *                 example: 2000
 *               offset:
 *                 type: integer
 *                 example: 0
 *     responses:
 *       200:
 *         description: Reportes generados exitosamente
 */
router.post('/generar-reportes-lote', utilsReportesController.generarReportesLote);

/**
 * @swagger
 * /api/utils/generar-comentarios-lote:
 *   post:
 *    summary: Genera comentarios aleatorios por lote (solo para pruebas)
 *  tags: [Utils]
 *   requestBody:
 *     required: false
 *    content:
 *      application/json:
 *        schema:
 *          type: object
 *         properties:
 *          totalComentarios:
 *           type: integer
 *          example: 2000
 *         offset:
 *          type: integer
 *         example: 0
 * responses:
 *  200:
 *   description: Comentarios generados exitosamente
 */
router.post('/generar-comentarios-lote', utilsComentariosController.generarComentariosLote);

module.exports = router;