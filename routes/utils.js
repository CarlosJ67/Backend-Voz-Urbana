const express = require('express');
const router = express.Router();
const utilsController = require('../controllers/utilsController');

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
 *                 example: 1000
 *     responses:
 *       200:
 *         description: Usuarios generados exitosamente
 */
router.post('/generar-usuarios-lote', utilsController.generarUsuariosLote);

module.exports = router;