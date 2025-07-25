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
 *                 example: 999998
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
 *                 example: 1000000
 *               offset:
 *                 type: integer
 *                 example: 0
 *               fechaInicio:
 *                 type: string
 *                 example: "2023-01-01"
 *               fechaFin:
 *                 type: string
 *                 example: "2023-12-31"
 *     responses:
 *       200:
 *         description: Reportes generados exitosamente
 */
router.post('/generar-reportes-lote', (req, res) => {
  const { totalReportes = 1000000, offset = 0, fechaInicio = '', fechaFin = '' }  = req.body || {};
  const cmd = `python seeders/seeder_reportes.py ${totalReportes} ${offset} "${fechaInicio} ${fechaFin}"`;
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ message: 'Error al ejecutar el seeder de reportes', error: error.message, stderr });
    }
    res.json({ message: 'Seeder de reportes ejecutado correctamente', stdout });
  });
});
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
router.post('/generar-comentarios-lote', (req, res) => {
  let { totalComentarios, offset } = req.body || {};

  // Validaciones
  totalComentarios = parseInt(totalComentarios);
  offset = parseInt(offset);

  // Asignar valores por defecto si son inválidos
  if (isNaN(totalComentarios) || totalComentarios <= 0) {
    totalComentarios = 100;
  }
  if (isNaN(offset) || offset < 0) {
    offset = 0;
  }

  const cmd = `python seeders/seeder_comentarios.py ${totalComentarios} ${offset}`;

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ 
        message: 'Error al ejecutar el seeder de comentarios', 
        error: error.message, 
        stderr 
      });
    }

    res.json({ 
      message: 'Seeder de comentarios ejecutado correctamente', 
      stdout 
    });
  });
});
/**
 @swagger
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
 *                 description: Cantidad de comentarios a generar. Valor por defecto: 100.
 *                 example: 2000
 *               offset:
 *                 type: integer
 *                 description: Cantidad de usuarios a omitir desde el inicio. Valor por defecto: 0.
 *                 example: 0
 *     responses:
 *       200:
 *         description: Comentarios generados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Seeder de comentarios ejecutado correctamente
 *                 stdout:
 *                   type: string
 *                   example: Comentarios generados con éxito.
 *       500:
 *         description: Error al ejecutar el seeder de comentarios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error al ejecutar el seeder de comentarios
 *                 error:
 *                   type: string
 *                   example: Error: el script no pudo ejecutarse
 *                 stderr:
 *                   type: string
 *                   example: Traceback (most recent call last): ...
 */
module.exports = router;