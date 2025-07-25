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
  const cmd = `python seeders/seeder_reportes.py ${totalReportes} ${offset} "${fechaInicio}" "${fechaFin}"`;

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
 *                 description: Cantidad de comentarios a generar
 *                 example: 1000000
 *               offset:
 *                 type: integer
 *                 description: Offset para continuar desde un punto específico
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
 *                   example: "Seeder de comentarios ejecutado correctamente"
 *                 stdout:
 *                   type: string
 *                   example: "Comentarios generados con éxito"
 *       500:
 *         description: Error al ejecutar el seeder de comentarios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error al ejecutar el seeder de comentarios"
 *                 error:
 *                   type: string
 *                   example: "Error en el script"
 *                 stderr:
 *                   type: string
 *                   example: "Traceback error details"
 */
router.post('/generar-comentarios-lote', (req, res) => {
  const { totalComentarios = 1000000, offset = 0 } = req.body || {};

  // Validaciones más simples, igual que los otros seeders
  const comentarios = parseInt(totalComentarios) || 1000000;
  const offsetValue = parseInt(offset) || 0;

  const cmd = `python seeders/seeder_comentarios.py ${comentarios} ${offsetValue}`;

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
 * @swagger
 * /api/utils/ejecutar-etl-reportes:
 *   post:
 *     summary: Ejecuta el proceso ETL para la tabla 'reportes'
 *     tags: [Utils]
 *     requestBody:
 *       required: false
 *     responses:
 *       200:
 *         description: ETL ejecutado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "ETL ejecutado correctamente"
 *                 archivo:
 *                   type: string
 *                   example: "etl_reportes_limpios_20250725_172756.csv"
 *                 stdout:
 *                   type: string
 *                   example: "Conectando y extrayendo datos de la tabla 'reportes'...\nProcesando los datos...\nETL completado. Archivo generado: etl_reportes_limpios_20250725_172756.csv"
 *       500:
 *         description: Error al ejecutar el proceso ETL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error al ejecutar el ETL"
 *                 error:
 *                   type: string
 *                   example: "Error en el script"
 *                 stderr:
 *                   type: string
 *                   example: "Traceback error details"
 */
router.post('/ejecutar-etl-reportes', (req, res) => {
  const cmd = `python seeders/etl_reportes.py`;

  exec(cmd, (error, stdout, stderr) => {
  if (error) {
    return res.status(500).json({
      message: 'Error al ejecutar el ETL',
      error: error.message,
      stderr
    });
  }

  // Extraer nombre de archivo desde stdout
  const match = stdout.match(/Archivo generado:\s*(.*\.csv)/);
  const fileName = match ? match[1] : null;

  res.json({
    message: 'ETL ejecutado correctamente',
    archivo: fileName,
    stdout
  });
});
});


module.exports = router;