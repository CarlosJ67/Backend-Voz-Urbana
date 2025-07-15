const express = require('express');
const {exec} = require('child_process');
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
router.post('/generar-usuarios-lote', (req, res) => {
  const { totalAdmins = 2, totalCiudadanos = 999998, offset = 0 } = req.body || {};
  const cmd = `python seeders/seeder_usuarios.py ${totalAdmins} ${totalCiudadanos} ${offset}`;
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ message: 'Error al ejecutar el seeder', error: error.message, stderr });
    }
    res.json({ message: 'Seeder ejecutado correctamente', stdout });
  });
});
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
 *     summary: Genera comentarios aleatorios por lote (solo para pruebas)
 *     tags: [Utils]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               totalComentarios:
 *                 type: integer
 *                 example: 2000
 *               offset:
 *                 type: integer
 *                 example: 0
 *     responses:
 *       200:
 *         description: Comentarios generados exitosamente
 */
router.post('/generar-comentarios-lote', utilsComentariosController.generarComentariosLote);

module.exports = router;