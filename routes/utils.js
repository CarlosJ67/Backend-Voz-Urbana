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
 *     summary: Ejecuta el proceso ETL para la tabla 'reportes' y el modelo automático de zonas críticas
 *     tags: [Utils]
 *     responses:
 *       200:
 *         description: ETL y modelo ejecutados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "ETL y modelo ejecutados exitosamente"
 *                 version:
 *                   type: string
 *                   example: "avanzado_v2.1"
 *                 data:
 *                   type: object
 *                   properties:
 *                     archivo_csv:
 *                       type: string
 *                       example: "exports/etl_data/etl_reportes_limpios_20250728_143022.csv"
 *                     modelo_path:
 *                       type: string
 *                       example: "modelos/zonas_criticas_avanzado_20250728_143045.joblib"
 *                     grafico_path:
 *                       type: string
 *                       example: "graficos/zonas_criticas_avanzado_20250728_143045.png"
 *                     metricas:
 *                       type: object
 *                     estadisticas_etl:
 *                       type: object
 *                       properties:
 *                         registros_procesados:
 *                           type: string
 *                           example: "969207"
 *                         reportes_alta_prioridad:
 *                           type: string
 *                           example: "412087"
 *                         tasa_retencion:
 *                           type: string
 *                           example: "96.9%"
 *       500:
 *         description: Error al ejecutar el proceso
 */

router.post('/ejecutar-etl-reportes', (req, res) => {
  const etlCmd = `python seeders/etl_reportes.py`;

  console.log('[ETL] Iniciando proceso ETL automático...');
  exec(etlCmd, (error, stdout, stderr) => {
    // Verificar si el ETL se completó exitosamente a pesar del error Unicode
    const archivoCompletado = stderr.match(/Archivo principal: (exports[\\\/]etl_data[\\\/]etl_reportes_limpios_\d{8}_\d{6}\.csv)/);
    
    if (error && !archivoCompletado) {
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

    // Si hay error pero el archivo se completó, es solo error de Unicode
    if (error && archivoCompletado) {
      console.log('[ETL] ETL completado exitosamente (error Unicode ignorado)');
      console.log('[ETL] Archivo generado:', archivoCompletado[1]);
    } else {
      console.log('[ETL] Proceso completado. Salida:', stdout);
    }
    
    // Buscar el archivo CSV en stderr si hay error Unicode, sino en stdout
    let csvMatch;
    if (archivoCompletado) {
      csvMatch = archivoCompletado;
    } else {
      csvMatch = stdout.match(/exports[\\\/]etl_data[\\\/]etl_reportes_limpios_\d{8}_\d+\.csv/i);
    }
    
    const csvPath = csvMatch ? csvMatch[1] || csvMatch[0] : null;

    if (!csvPath) {
      const errorMsg = 'No se pudo extraer la ruta del CSV generado del ETL';
      console.error('[ETL]', errorMsg, { stdout, stderr });
      
      return res.status(500).json({
        success: false,
        etapa: 'ETL',
        error: {
          message: errorMsg,
          detalles: 'El proceso ETL no devolvió una ruta de archivo válida'
        },
        stdout,
        stderr
      });
    }

    // Normalizar la ruta para sistemas Windows/Unix
    const csvPathNormalized = csvPath.replace(/\\/g, '/');
    console.log('[MODELO] Iniciando modelo automático con archivo:', csvPathNormalized);

    const modelCmd = `python seeders/aprendizaje_no_supervisado.py "${csvPathNormalized}" --quiet`;

    console.log('[MODELO] Comando automático:', modelCmd);

    exec(modelCmd, { maxBuffer: 1024 * 1024 * 10 }, (modelErr, modelStdout, modelStderr) => {
      if (modelErr) {
        console.error('[MODELO] Error durante ejecución:', {
          error: modelErr.message,
          stderr: modelStderr,
          code: modelErr.code
        });
        
        return res.status(500).json({
          success: false,
          etapa: 'Modelo',
          archivo_csv: csvPathNormalized,
          error: {
            message: modelErr.message,
            detalles: modelStderr
          },
          timestamp: new Date().toISOString()
        });
      }

      console.log('[MODELO] Proceso completado. Salida JSON:', modelStdout);
      
      try {
        // Parsear la salida JSON del modelo avanzado
        const result = JSON.parse(modelStdout);
        
        if (!result.success) {
          console.error('[MODELO] Error en el modelo avanzado:', result.error);
          return res.status(500).json({
            success: false,
            etapa: 'Modelo',
            archivo_csv: csvPathNormalized,
            error: {
              message: result.error,
              detalles: result.traceback || 'Error en el modelo avanzado'
            },
            timestamp: new Date().toISOString()
          });
        }

        // Validar que las rutas existen
        const modeloPath = result.modelo_path;
        const graficoPath = result.grafico_path;
        const version = result.version || 'avanzado_v2.1';

        if (!modeloPath || !graficoPath) {
          console.error('[MODELO] Rutas faltantes en la salida JSON:', result);
          return res.status(500).json({
            success: false,
            etapa: 'Modelo',
            archivo_csv: csvPathNormalized,
            error: {
              message: 'El modelo avanzado no generó todas las rutas esperadas',
              detalles: 'Faltan modelo_path o grafico_path'
            },
            timestamp: new Date().toISOString()
          });
        }

        // ✅ RESPUESTA SIMPLIFICADA - sin mostrar parámetros técnicos
        res.json({
          success: true,
          message: 'ETL y modelo ejecutados exitosamente',
          version: version,
          data: {
            archivo_csv: csvPathNormalized,
            modelo_path: modeloPath,
            grafico_path: graficoPath,
            metricas: result.metricas || {},
            // Estadísticas del ETL extraídas del log
            estadisticas_etl: {
              registros_procesados: stderr.match(/Registros procesados: (\d+)\/(\d+)/)?.[1] || 'N/A',
              registros_totales: stderr.match(/Registros procesados: (\d+)\/(\d+)/)?.[2] || 'N/A',
              reportes_alta_prioridad: stderr.match(/Reportes alta prioridad: (\d+)/)?.[1] || 'N/A',
              tasa_retencion: stderr.match(/\(([0-9.]+)%\)/)?.[1] + '%' || 'N/A'
            }
          },
          logs: {
            etl: stderr || stdout,
            modelo: modelStderr || 'Logs enviados a stderr'
          },
          warnings: error ? ['Error Unicode en la salida del ETL (ignorado)'] : [],
          timestamp: new Date().toISOString()
        });

      } catch (parseError) {
        console.error('[MODELO] Error al parsear la salida JSON:', parseError);
        console.error('Salida original:', modelStdout);
        
        return res.status(500).json({
          success: false,
          etapa: 'Modelo',
          archivo_csv: csvPathNormalized,
          error: {
            message: 'Error al procesar la salida del modelo avanzado',
            detalles: `Parse error: ${parseError.message}`,
            salida_original: modelStdout.substring(0, 500)
          },
          timestamp: new Date().toISOString()
        });
      }
    });
  });
});

module.exports = router;