const express = require('express');
const {exec} = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');  // ✅ AGREGADO para archivos temporales
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
 *     summary: Ejecuta el proceso ETL para la tabla 'reportes' y el modelo híbrido de zonas críticas con predicciones
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
 *                   example: "hibrido_v2.1"
 *                 data:
 *                   type: object
 *                   properties:
 *                     archivo_csv:
 *                       type: string
 *                       example: "exports/etl_data/etl_reportes_limpios_20250729_154022.csv"
 *                     modelo_path:
 *                       type: string
 *                       example: "modelos/zonas_criticas_avanzado_20250729_154045.joblib"
 *                     grafico_path:
 *                       type: string
 *                       example: "graficos/zonas_criticas_avanzado_20250729_154045.png"
 *                     metricas:
 *                       type: object
 *                       properties:
 *                         silhouette_score:
 *                           type: number
 *                           example: 0.742
 *                         n_clusters:
 *                           type: integer
 *                           example: 4
 *                         prediccion:
 *                           type: object
 *                           properties:
 *                             mae:
 *                               type: number
 *                               example: 2.34
 *                             r2:
 *                               type: number
 *                               example: 0.651
 *                         zonas_con_prediccion:
 *                           type: integer
 *                           example: 4
 *                         total_recomendaciones:
 *                           type: integer
 *                           example: 12
 *                     modelo_hibrido:
 *                       type: object
 *                       properties:
 *                         predicciones_futuras:
 *                           type: object
 *                           additionalProperties:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 semana:
 *                                   type: integer
 *                                   example: 1
 *                                 fecha:
 *                                   type: string
 *                                   example: "2025-08-05"
 *                                 reportes_predichos:
 *                                   type: integer
 *                                   example: 12
 *                         recomendaciones:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               zona:
 *                                 type: string
 *                                 example: "Zona 0"
 *                               accion:
 *                                 type: string
 *                                 example: "Reforzar atención preventiva - Se esperan 12 reportes"
 *                               prioridad:
 *                                 type: string
 *                                 example: "ALTA"
 *                               coordenadas:
 *                                 type: string
 *                                 example: "(20.2750, -97.9550)"
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
    console.log('[MODELO] Iniciando modelo híbrido con archivo:', csvPathNormalized);

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

        // ✅ FUNCIÓN MEJORADA DE EXTRACCIÓN DE DATOS HÍBRIDOS
        const extraerDatosHibridos = () => {
          return new Promise((resolve) => {
            
            // ✅ CREAR ARCHIVO TEMPORAL PARA EVITAR PROBLEMAS DE COMILLAS
            const tempScriptPath = path.join(os.tmpdir(), `extract_hibrido_${Date.now()}.py`);
            
            const extractScript = `
import joblib
import json
import sys
import os

try:
    modelo_path = "${modeloPath.replace(/\\/g, '/')}"
    
    if not os.path.exists(modelo_path):
        resultado = {"es_hibrido": False, "error": "Modelo no encontrado"}
        print(json.dumps(resultado, ensure_ascii=False, indent=2))
        sys.exit(0)
    
    # Cargar modelo
    modelo_data = joblib.load(modelo_path)
    
    # Extraer información del modelo híbrido
    resultado_extraccion = {
        "es_hibrido": modelo_data.get('metadata', {}).get('es_modelo_hibrido', False),
        "metricas": modelo_data.get('metricas_validacion', {}),
        "predicciones_futuras": {},
        "recomendaciones": []
    }
    
    # Si es híbrido, extraer predicciones y recomendaciones
    if 'modelo_prediccion' in modelo_data:
        pred_data = modelo_data['modelo_prediccion']
        resultado_extraccion["predicciones_futuras"] = pred_data.get('predicciones_futuras', {})
        resultado_extraccion["recomendaciones"] = pred_data.get('recomendaciones', [])
        
        # Fusionar métricas de predicción con las principales
        if 'metricas_prediccion' in pred_data:
            resultado_extraccion["metricas"]["prediccion"] = pred_data['metricas_prediccion']
        
        # Agregar contadores
        resultado_extraccion["metricas"]["zonas_con_prediccion"] = len(pred_data.get('predicciones_futuras', {}))
        resultado_extraccion["metricas"]["total_recomendaciones"] = len(pred_data.get('recomendaciones', []))
    
    # Imprimir resultado con formato bonito
    print(json.dumps(resultado_extraccion, ensure_ascii=False, indent=2))
    
except Exception as e:
    error_resultado = {"es_hibrido": False, "error": str(e)}
    print(json.dumps(error_resultado, ensure_ascii=False, indent=2))
    sys.exit(1)
`;

            // ✅ ESCRIBIR SCRIPT TEMPORAL
            fs.writeFileSync(tempScriptPath, extractScript, 'utf8');
            
            // ✅ EJECUTAR SCRIPT TEMPORAL
            exec(`python "${tempScriptPath}"`, { 
              timeout: 30000,
              maxBuffer: 1024 * 1024 * 5 // 5MB buffer
            }, (error, stdout, stderr) => {
              
              // ✅ LIMPIAR ARCHIVO TEMPORAL
              try {
                fs.unlinkSync(tempScriptPath);
              } catch (cleanupError) {
                console.warn('[HÍBRIDO] Error limpiando archivo temporal:', cleanupError.message);
              }
              
              console.log('[HÍBRIDO] STDOUT completo:', stdout);
              console.log('[HÍBRIDO] STDERR:', stderr);
              
              if (error) {
                console.warn('[HÍBRIDO] Error ejecutando extracción:', error.message);
                resolve({ es_hibrido: false, error: error.message });
                return;
              }
              
              if (!stdout || stdout.trim() === '') {
                console.warn('[HÍBRIDO] Salida vacía del script de extracción');
                resolve({ es_hibrido: false, error: 'Salida vacía' });
                return;
              }
              
              try {
                // ✅ LIMPIAR Y PARSEAR JSON
                const jsonLimpio = stdout.trim();
                console.log('[HÍBRIDO] JSON a parsear:', jsonLimpio);
                
                const datos = JSON.parse(jsonLimpio);
                
                if (datos.es_hibrido) {
                  console.log('✅ [HÍBRIDO] Datos híbridos extraídos exitosamente');
                  console.log(`📊 Predicciones: ${Object.keys(datos.predicciones_futuras || {}).length} zonas`);
                  console.log(`💡 Recomendaciones: ${(datos.recomendaciones || []).length} elementos`);
                  console.log(`🎯 Métricas híbridas:`, datos.metricas);
                } else {
                  console.log('ℹ️ [HÍBRIDO] Modelo solo clustering (no híbrido)');
                  if (datos.error) {
                    console.log(`   Razón: ${datos.error}`);
                  }
                }
                
                resolve(datos);
                
              } catch (parseError) {
                console.error('[HÍBRIDO] Error parseando JSON:', parseError.message);
                console.error('[HÍBRIDO] Contenido problemático:', stdout);
                resolve({ 
                  es_hibrido: false, 
                  error: `Parse error: ${parseError.message}`,
                  raw_output: stdout
                });
              }
            });
          });
        };

        // ✅ EJECUTAR EXTRACCIÓN DE DATOS HÍBRIDOS
        extraerDatosHibridos().then(datosHibridos => {
          
          // ✅ CONSTRUIR RESPUESTA MEJORADA (mantiene compatibilidad total)
          const respuesta = {
            success: true,
            message: 'ETL y modelo ejecutados exitosamente',
            version: datosHibridos.es_hibrido ? 'hibrido_v2.1' : version,
            data: {
              archivo_csv: csvPathNormalized,
              modelo_path: modeloPath,
              grafico_path: graficoPath,
              metricas: datosHibridos.metricas || result.metricas || {},
              // ✅ ESTADÍSTICAS ETL SE MANTIENEN IGUALES
              estadisticas_etl: {
                registros_procesados: stderr.match(/Registros procesados: (\d+)\/(\d+)/)?.[1] || 'N/A',
                registros_totales: stderr.match(/Registros procesados: (\d+)\/(\d+)/)?.[2] || 'N/A',
                reportes_alta_prioridad: stderr.match(/Reportes alta prioridad: (\d+)/)?.[1] || 'N/A',
                tasa_retencion: stderr.match(/\(([0-9.]+)%\)/)?.[1] + '%' || 'N/A'
              },
              // ✅ AGREGAR DATOS HÍBRIDOS SOLO SI ESTÁN DISPONIBLES
              ...(datosHibridos.es_hibrido && {
                modelo_hibrido: {
                  predicciones_futuras: datosHibridos.predicciones_futuras,
                  recomendaciones: datosHibridos.recomendaciones
                }
              })
            },
            logs: {
              etl: stderr || stdout,
              modelo: modelStderr || 'Logs enviados a stderr'
            },
            warnings: error ? ['Error Unicode en la salida del ETL (ignorado)'] : [],
            timestamp: new Date().toISOString()
          };

          // ✅ RESPUESTA FINAL
          console.log(`🎉 [MODELO] ${datosHibridos.es_hibrido ? 'Modelo híbrido' : 'Modelo clustering'} completado exitosamente`);
          res.json(respuesta);
          
        }).catch(extractError => {
          console.warn('[HÍBRIDO] Error en extracción híbrida, devolviendo respuesta básica:', extractError.message);
          
          // ✅ FALLBACK A RESPUESTA BÁSICA SI FALLA LA EXTRACCIÓN
          res.json({
            success: true,
            message: 'ETL y modelo ejecutados exitosamente',
            version: version,
            data: {
              archivo_csv: csvPathNormalized,
              modelo_path: modeloPath,
              grafico_path: graficoPath,
              metricas: result.metricas || {},
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