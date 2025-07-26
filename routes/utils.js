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

/**
 * @swagger
 * /api/utils/ejecutar-etl-reportes:
 *   post:
 *     summary: Ejecuta el proceso ETL para la tabla 'reportes' y | luego el modelo de aprendizaje supervisado
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
  const etlCmd = `python seeders/etl_reportes.py`;

  console.log('[ETL] Iniciando proceso ETL...');
  exec(etlCmd, (error, stdout, stderr) => {
    if (error) {
      console.error('[ETL] Error durante ejecución:', { 
        error: error.message, 
        stderr,
        code: error.code,
        signal: error.signal
      });
      
      return res.status(500).json({
        success: false,
        etapa: 'ETL',
        error: {
          message: error.message,
          code: error.code,
          detalles: stderr
        },
        timestamp: new Date().toISOString()
      });
    }

    console.log('[ETL] Proceso completado. Salida:', stdout);
    
    // Extraer la ruta del CSV
    const match = stdout.match(/exports[\\\/].*?etl_reportes_limpios_\d{8}_\d+\.csv/i); 
    const csvPath = match ? match[0].replace(/\\/g, '/') : null;

    if (!csvPath) {
      const errorMsg = 'No se pudo extraer la ruta del CSV generado';
      console.error('[ETL]', errorMsg, { stdout });
      
      return res.status(500).json({
        success: false,
        etapa: 'ETL',
        error: {
          message: errorMsg,
          detalles: 'El proceso ETL no devolvió una ruta de archivo válida'
        },
        stdout
      });
    }

    console.log('[MODELO] Iniciando modelo con archivo:', csvPath);
    const modelCmd = `python seeders/aprendizaje_no_supervisado.py "${csvPath}" --eps 0.01 --min_samples 5`;

    exec(modelCmd, (modelErr, modelStdout, modelStderr) => {
      if (modelErr) {
        console.error('[MODELO] Error durante ejecución:', {
          error: modelErr.message,
          stderr: modelStderr,
          code: modelErr.code
        });
        
        return res.status(500).json({
          success: false,
          etapa: 'Modelo',
          archivo_csv: csvPath,
          error: {
            message: modelErr.message,
            detalles: modelStderr
          }
        });
      }

      console.log('[MODELO] Proceso completado. Salida:', modelStdout);
      
      try {
        // Parsear la salida JSON del script Python
        const result = JSON.parse(modelStdout);
        
        if (!result.success) {
          console.error('[MODELO] Error en el script Python:', result.error);
          return res.status(500).json({
            success: false,
            etapa: 'Modelo',
            archivo_csv: csvPath,
            error: {
              message: result.error,
              detalles: result.traceback || 'Error en el modelo'
            }
          });
        }

        // Extraer rutas de los archivos generados desde el JSON
        const modeloPath = result.modelo_path;
        const graficoPath = result.grafico_path;

        if (!modeloPath || !graficoPath) {
          console.error('[MODELO] No se encontraron rutas en la salida JSON');
          return res.status(500).json({
            success: false,
            etapa: 'Modelo',
            archivo_csv: csvPath,
            error: {
              message: 'El modelo no generó las rutas esperadas',
              detalles: modelStdout
            }
          });
        }

        res.json({
          success: true,
          message: 'Procesos completados exitosamente',
          data: {
            archivo_csv: csvPath,
            modelo_path: modeloPath,
            grafico_path: graficoPath
          },
          logs: {
            etl: stdout,
            modelo: modelStdout
          },
          timestamp: new Date().toISOString()
        });

      } catch (parseError) {
        console.error('[MODELO] Error al parsear la salida JSON:', parseError);
        console.error('Salida original:', modelStdout);
        
        return res.status(500).json({
          success: false,
          etapa: 'Modelo',
          archivo_csv: csvPath,
          error: {
            message: 'Error al procesar la salida del modelo',
            detalles: modelStdout
          }
        });
      }
    });
  });
});

module.exports = router;