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
 * components:
 *   schemas:
 *     UtilsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Proceso ejecutado correctamente"
 *         data:
 *           type: object
 *           description: Datos específicos del proceso ejecutado
 *         timestamp:
 *           type: string
 *           format: date-time
 *           example: "2024-08-10T15:30:00Z"
 *     
 *     UtilsErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Error al ejecutar el proceso"
 *         error:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "Detalles específicos del error"
 *             code:
 *               type: string
 *               example: "PROCESS_ERROR"
 *             detalles:
 *               type: string
 *               example: "Información técnica adicional"
 *         etapa:
 *           type: string
 *           example: "ETL"
 *         timestamp:
 *           type: string
 *           format: date-time
 *           example: "2024-08-10T15:30:00Z"
 *     
 *     SeederUsuariosRequest:
 *       type: object
 *       properties:
 *         totalAdmins:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *           default: 2
 *           description: Número de administradores a generar
 *           example: 2
 *         totalCiudadanos:
 *           type: integer
 *           minimum: 0
 *           maximum: 1000000
 *           default: 999998
 *           description: Número de ciudadanos a generar
 *           example: 999998
 *         offset:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *           description: Índice de inicio para generación continua
 *           example: 0
 *     
 *     SeederReportesRequest:
 *       type: object
 *       properties:
 *         totalReportes:
 *           type: integer
 *           minimum: 0
 *           maximum: 10000000
 *           default: 1000000
 *           description: Número de reportes a generar
 *           example: 1000000
 *         offset:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *           description: Índice de inicio para generación continua
 *           example: 0
 *         fechaInicio:
 *           type: string
 *           format: date
 *           description: Fecha inicial para el rango de reportes
 *           example: "2023-01-01"
 *         fechaFin:
 *           type: string
 *           format: date
 *           description: Fecha final para el rango de reportes
 *           example: "2023-12-31"
 *     
 *     SeederComentariosRequest:
 *       type: object
 *       properties:
 *         totalComentarios:
 *           type: integer
 *           minimum: 0
 *           maximum: 10000000
 *           default: 1000000
 *           description: Número de comentarios a generar
 *           example: 1000000
 *         offset:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *           description: Índice de inicio para generación continua
 *           example: 0
 *     
 *     ETLResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "ETL y modelo ejecutados exitosamente"
 *         version:
 *           type: string
 *           enum: [hibrido_v2.1, avanzado_v2.1, clustering_v1.0]
 *           example: "hibrido_v2.1"
 *         data:
 *           type: object
 *           properties:
 *             archivo_csv:
 *               type: string
 *               description: Ruta del archivo CSV procesado
 *               example: "exports/etl_data/etl_reportes_limpios_20250810_154022.csv"
 *             modelo_path:
 *               type: string
 *               description: Ruta del modelo de ML generado
 *               example: "modelos/zonas_criticas_avanzado_20250810_154045.joblib"
 *             grafico_path:
 *               type: string
 *               description: Ruta del gráfico de visualización
 *               example: "graficos/zonas_criticas_avanzado_20250810_154045.png"
 *             metricas:
 *               type: object
 *               properties:
 *                 silhouette_score:
 *                   type: number
 *                   format: float
 *                   description: Puntuación de calidad del clustering
 *                   example: 0.742
 *                 n_clusters:
 *                   type: integer
 *                   description: Número de clusters identificados
 *                   example: 4
 *                 prediccion:
 *                   type: object
 *                   properties:
 *                     mae:
 *                       type: number
 *                       format: float
 *                       description: Error absoluto medio de predicción
 *                       example: 2.34
 *                     r2:
 *                       type: number
 *                       format: float
 *                       description: Coeficiente de determinación
 *                       example: 0.651
 *                 zonas_con_prediccion:
 *                   type: integer
 *                   description: Número de zonas con predicciones futuras
 *                   example: 4
 *                 total_recomendaciones:
 *                   type: integer
 *                   description: Total de recomendaciones generadas
 *                   example: 12
 *             estadisticas_etl:
 *               type: object
 *               properties:
 *                 registros_procesados:
 *                   type: string
 *                   description: Cantidad de registros procesados
 *                   example: "969207"
 *                 reportes_alta_prioridad:
 *                   type: string
 *                   description: Reportes clasificados como alta prioridad
 *                   example: "412087"
 *                 tasa_retencion:
 *                   type: string
 *                   description: Porcentaje de datos conservados tras limpieza
 *                   example: "96.9%"
 *             modelo_hibrido:
 *               type: object
 *               description: Datos específicos del modelo híbrido (solo si aplica)
 *               properties:
 *                 predicciones_futuras:
 *                   type: object
 *                   additionalProperties:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         semana:
 *                           type: integer
 *                           example: 1
 *                         fecha:
 *                           type: string
 *                           format: date
 *                           example: "2025-08-17"
 *                         reportes_predichos:
 *                           type: integer
 *                           example: 12
 *                 recomendaciones:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       zona:
 *                         type: string
 *                         example: "Zona 0"
 *                       accion:
 *                         type: string
 *                         example: "Reforzar atención preventiva - Se esperan 12 reportes"
 *                       prioridad:
 *                         type: string
 *                         enum: [ALTA, MEDIA, BAJA]
 *                         example: "ALTA"
 *                       coordenadas:
 *                         type: string
 *                         example: "(20.2750, -97.9550)"
 */

/**
 * @swagger
 * tags:
 *   name: 🛠️ Utils
 *   description: Herramientas de utilidad para desarrollo, testing y análisis de datos. Incluye generadores de datos de prueba (seeders) y procesos ETL con machine learning para análisis de zonas críticas y predicciones de reportes ciudadanos.
 */

/**
 * @swagger
 * /api/utils/generar-usuarios-lote:
 *   post:
 *     summary: Generar usuarios de prueba en lote
 *     description: |
 *       Ejecuta un script de seeding que genera usuarios ficticios para pruebas de carga y desarrollo de la aplicación.
 *       
 *       **Funcionalidad:**
 *       - Genera administradores y ciudadanos con datos realistas
 *       - Utiliza nombres, emails y datos demográficos variados
 *       - Asigna roles y permisos apropiados automáticamente
 *       - Optimizado para inserción masiva en base de datos
 *       
 *       **Datos generados por usuario:**
 *       - Información personal: nombre, email, teléfono
 *       - Credenciales de acceso seguras con hash bcrypt
 *       - Fecha de registro distribuida temporalmente
 *       - Puntos de reputación iniciales aleatorios
 *       
 *       **Casos de uso:**
 *       - Pruebas de rendimiento con grandes volúmenes
 *       - Simulación de comportamiento ciudadano
 *       - Testing de funcionalidades de administración
 *       - Evaluación de escalabilidad del sistema
 *       - Generación de datasets para análisis
 *       
 *       **⚠️ IMPORTANTE:** Este endpoint está destinado únicamente para entornos de desarrollo y testing.
 *     tags: [🛠️ Utils]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SeederUsuariosRequest'
 *           examples:
 *             configuracion_pequena:
 *               summary: Configuración para testing pequeño
 *               description: Ideal para pruebas rápidas de funcionalidad
 *               value:
 *                 totalAdmins: 2
 *                 totalCiudadanos: 100
 *                 offset: 0
 *             configuracion_media:
 *               summary: Configuración para testing medio
 *               description: Balanceada para pruebas de rendimiento moderado
 *               value:
 *                 totalAdmins: 5
 *                 totalCiudadanos: 10000
 *                 offset: 0
 *             configuracion_grande:
 *               summary: Configuración para stress testing
 *               description: Pruebas de carga y escalabilidad máxima
 *               value:
 *                 totalAdmins: 10
 *                 totalCiudadanos: 999990
 *                 offset: 0
 *             configuracion_continua:
 *               summary: Generación continua desde offset
 *               description: Para continuar generación desde punto específico
 *               value:
 *                 totalAdmins: 0
 *                 totalCiudadanos: 50000
 *                 offset: 100000
 *     responses:
 *       200:
 *         description: ✅ Usuarios generados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Seeder ejecutado correctamente"
 *                 stdout:
 *                   type: string
 *                   description: Salida detallada del proceso de generación
 *                   example: "Generados 2 administradores y 999998 ciudadanos exitosamente. Tiempo total: 45.2 segundos"
 *                 estadisticas:
 *                   type: object
 *                   properties:
 *                     usuarios_creados:
 *                       type: integer
 *                       example: 1000000
 *                     tiempo_ejecucion:
 *                       type: string
 *                       example: "45.2 segundos"
 *                     tasa_insercion:
 *                       type: string
 *                       example: "22087 usuarios/segundo"
 *             examples:
 *               generacion_exitosa:
 *                 summary: Proceso completado exitosamente
 *                 value:
 *                   message: "Seeder ejecutado correctamente"
 *                   stdout: "✅ Generación masiva de usuarios completada\n📊 Estadísticas finales:\n   - Administradores: 2\n   - Ciudadanos: 999998\n   - Total: 1000000\n⏱️  Tiempo total: 45.2 segundos\n📈 Tasa de inserción: 22087 usuarios/segundo"
 *                   estadisticas:
 *                     usuarios_creados: 1000000
 *                     tiempo_ejecucion: "45.2 segundos"
 *                     tasa_insercion: "22087 usuarios/segundo"
 *       500:
 *         description: ❌ Error durante la generación de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error al ejecutar el seeder"
 *                 error:
 *                   type: string
 *                   example: "Connection timeout to database"
 *                 stderr:
 *                   type: string
 *                   example: "Traceback de error detallado del script Python"
 *             examples:
 *               error_base_datos:
 *                 summary: Error de conexión a base de datos
 *                 value:
 *                   message: "Error al ejecutar el seeder"
 *                   error: "Database connection timeout after 30 seconds"
 *                   stderr: "psycopg2.OperationalError: timeout expired"
 *               error_memoria:
 *                 summary: Error de memoria insuficiente
 *                 value:
 *                   message: "Error al ejecutar el seeder"
 *                   error: "MemoryError: Unable to allocate array"
 *                   stderr: "Sistema requiere más RAM para procesar 1M usuarios"
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
 *     summary: Generar reportes de prueba en lote
 *     description: |
 *       Ejecuta un script que genera reportes ciudadanos ficticios con datos realistas para testing y análisis.
 *       
 *       **Funcionalidad:**
 *       - Genera reportes con problemas urbanos variados y realistas
 *       - Distribuye geográficamente dentro del municipio de Xicotepec
 *       - Asigna categorías balanceadas (infraestructura, servicios, seguridad)
 *       - Simula patrones temporales y estacionales reales
 *       - Incluye variación de prioridades y estados
 *       
 *       **Características de los reportes generados:**
 *       - Títulos y descripciones contextuales según categoría
 *       - Coordenadas GPS válidas dentro de límites municipales
 *       - Distribución temporal configurable por fechas
 *       - Estados evolutivos (nuevo → en_proceso → resuelto)
 *       - Prioridades balanceadas según tipo de problema
 *       
 *       **Distribución de categorías:**
 *       - 40% Infraestructura (baches, banquetas, alumbrado)
 *       - 25% Servicios públicos (agua, drenaje, recolección)
 *       - 20% Seguridad pública (iluminación, vigilancia)
 *       - 15% Otras categorías (parques, señalización, etc.)
 *       
 *       **Casos de uso:**
 *       - Testing de rendimiento con grandes volúmenes
 *       - Análisis de patrones temporales y geográficos
 *       - Entrenamiento de modelos de machine learning
 *       - Validación de algoritmos de clustering
 *       - Simulación de carga de trabajo real
 *     tags: [🛠️ Utils]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SeederReportesRequest'
 *           examples:
 *             testing_basico:
 *               summary: Testing básico de funcionalidad
 *               description: Ideal para verificar funcionamiento general
 *               value:
 *                 totalReportes: 1000
 *                 offset: 0
 *                 fechaInicio: "2024-01-01"
 *                 fechaFin: "2024-12-31"
 *             analisis_anual:
 *               summary: Dataset para análisis de año completo
 *               description: Datos distribuidos durante un año completo
 *               value:
 *                 totalReportes: 100000
 *                 offset: 0
 *                 fechaInicio: "2023-01-01"
 *                 fechaFin: "2023-12-31"
 *             stress_testing:
 *               summary: Prueba de stress con millón de reportes
 *               description: Evaluación de escalabilidad máxima
 *               value:
 *                 totalReportes: 1000000
 *                 offset: 0
 *                 fechaInicio: "2020-01-01"
 *                 fechaFin: "2024-12-31"
 *             datos_historicos:
 *               summary: Simulación de datos históricos multi-año
 *               description: Para análisis de tendencias a largo plazo
 *               value:
 *                 totalReportes: 500000
 *                 offset: 0
 *                 fechaInicio: "2018-01-01"
 *                 fechaFin: "2024-07-31"
 *     responses:
 *       200:
 *         description: ✅ Reportes generados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Seeder de reportes ejecutado correctamente"
 *                 stdout:
 *                   type: string
 *                   description: Salida detallada con estadísticas de generación
 *                   example: "Generados 1000000 reportes entre 2023-01-01 y 2023-12-31. Distribución: 40% infraestructura, 25% servicios, 20% seguridad, 15% otros"
 *                 estadisticas:
 *                   type: object
 *                   properties:
 *                     reportes_creados:
 *                       type: integer
 *                       example: 1000000
 *                     periodo:
 *                       type: string
 *                       example: "2023-01-01 a 2023-12-31"
 *                     categorias_distribuidas:
 *                       type: object
 *                       example:
 *                         infraestructura: 400000
 *                         servicios: 250000
 *                         seguridad: 200000
 *                         otros: 150000
 *             examples:
 *               generacion_masiva:
 *                 summary: Generación masiva completada
 *                 value:
 *                   message: "Seeder de reportes ejecutado correctamente"
 *                   stdout: "🏗️  Generación masiva de reportes completada\n📊 Estadísticas de distribución:\n   - Infraestructura: 400,000 (40%)\n   - Servicios públicos: 250,000 (25%)\n   - Seguridad: 200,000 (20%)\n   - Otros: 150,000 (15%)\n📅 Período: 2023-01-01 a 2023-12-31\n⏱️  Tiempo total: 128.7 segundos"
 *       500:
 *         description: ❌ Error durante la generación de reportes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UtilsErrorResponse'
 *             examples:
 *               error_fechas_invalidas:
 *                 summary: Rango de fechas inválido
 *                 value:
 *                   message: "Error al ejecutar el seeder de reportes"
 *                   error: "Fecha de inicio posterior a fecha de fin"
 *                   stderr: "ValueError: start_date must be before end_date"
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
 *     summary: Generar comentarios de prueba en lote
 *     description: |
 *       Ejecuta un script que genera comentarios realistas en reportes existentes para simular participación ciudadana.
 *       
 *       **Funcionalidad:**
 *       - Genera comentarios contextualmente apropiados por categoría
 *       - Distribuye comentarios entre reportes existentes de forma balanceada
 *       - Simula diferentes tipos de participación ciudadana
 *       - Incluye variación de longitud y tono según tipo de usuario
 *       - Respeta flujo temporal lógico (comentarios posteriores a reportes)
 *       
 *       **Tipos de comentarios generados:**
 *       - Confirmación de problemas por otros ciudadanos
 *       - Solicitudes de actualización de estado
 *       - Información adicional complementaria
 *       - Agradecimientos por resolución de problemas
 *       - Seguimiento y preguntas sobre progreso
 *       
 *       **Características técnicas:**
 *       - Asociación inteligente con reportes compatibles
 *       - Distribución temporal realista
 *       - Variación de autores para simular comunidad activa
 *       - Filtrado de contenido apropiado
 *       - Optimización para inserción masiva
 *       
 *       **Casos de uso:**
 *       - Simulación de participación comunitaria activa
 *       - Testing de sistemas de comentarios y notificaciones
 *       - Análisis de engagement ciudadano
 *       - Evaluación de rendimiento con alta actividad
 *       - Entrenamiento de modelos de análisis de sentimientos
 *     tags: [🛠️ Utils]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SeederComentariosRequest'
 *           examples:
 *             testing_moderado:
 *               summary: Testing con cantidad moderada
 *               description: Para verificar funcionalidad básica de comentarios
 *               value:
 *                 totalComentarios: 5000
 *                 offset: 0
 *             simulacion_comunidad_activa:
 *               summary: Simulación de comunidad muy participativa
 *               description: Alta densidad de comentarios por reporte
 *               value:
 *                 totalComentarios: 100000
 *                 offset: 0
 *             stress_testing_comentarios:
 *               summary: Prueba de stress para sistema de comentarios
 *               description: Evaluación de límites del sistema
 *               value:
 *                 totalComentarios: 1000000
 *                 offset: 0
 *             generacion_continua:
 *               summary: Continuación desde offset específico
 *               description: Para procesos de generación interrumpidos
 *               value:
 *                 totalComentarios: 250000
 *                 offset: 750000
 *     responses:
 *       200:
 *         description: ✅ Comentarios generados exitosamente
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
 *                   description: Estadísticas detalladas de generación
 *                   example: "Generados 1000000 comentarios distribuidos en 150000 reportes. Promedio: 6.7 comentarios por reporte"
 *                 metricas:
 *                   type: object
 *                   properties:
 *                     comentarios_generados:
 *                       type: integer
 *                       example: 1000000
 *                     reportes_comentados:
 *                       type: integer
 *                       example: 150000
 *                     promedio_por_reporte:
 *                       type: number
 *                       format: float
 *                       example: 6.7
 *                     distribucion_tipos:
 *                       type: object
 *                       example:
 *                         confirmacion: 350000
 *                         seguimiento: 280000
 *                         informacion_adicional: 220000
 *                         agradecimiento: 150000
 *             examples:
 *               generacion_completa:
 *                 summary: Proceso de generación completado
 *                 value:
 *                   message: "Seeder de comentarios ejecutado correctamente"
 *                   stdout: "💬 Generación masiva de comentarios completada\n📊 Distribución por tipo:\n   - Confirmaciones: 350,000 (35%)\n   - Seguimientos: 280,000 (28%)\n   - Info adicional: 220,000 (22%)\n   - Agradecimientos: 150,000 (15%)\n📈 Promedio: 6.7 comentarios por reporte\n⏱️  Tiempo total: 89.3 segundos"
 *       500:
 *         description: ❌ Error durante la generación de comentarios
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UtilsErrorResponse'
 *             examples:
 *               sin_reportes_disponibles:
 *                 summary: No hay reportes para comentar
 *                 value:
 *                   message: "Error al ejecutar el seeder de comentarios"
 *                   error: "No se encontraron reportes disponibles para comentar"
 *                   stderr: "La tabla de reportes está vacía. Ejecuta primero el seeder de reportes."
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
 *     summary: Ejecutar proceso ETL y análisis inteligente de reportes
 *     description: |
 *       Ejecuta un pipeline completo de ETL (Extract, Transform, Load) seguido de análisis avanzado con machine learning para identificar zonas críticas y generar predicciones.
 *       
 *       **Proceso ETL (Extract, Transform, Load):**
 *       - **Extracción:** Obtiene todos los reportes de la base de datos
 *       - **Transformación:** Limpia datos, normaliza ubicaciones, categoriza problemas
 *       - **Carga:** Genera archivo CSV optimizado para análisis de ML
 *       - **Validación:** Verifica integridad y consistencia de datos
 *       
 *       **Análisis con Machine Learning:**
 *       - **Clustering:** Identifica zonas geográficas con alta concentración de problemas
 *       - **Clasificación:** Analiza patrones por tipo de reporte y prioridad
 *       - **Predicción:** Genera pronósticos de futuros reportes por zona
 *       - **Recomendaciones:** Sugiere acciones preventivas basadas en datos
 *       
 *       **Modelo Híbrido Avanzado:**
 *       - Combina clustering geográfico con predicción temporal
 *       - Identifica zonas críticas actuales y futuras
 *       - Calcula métricas de calidad (Silhouette Score, R², MAE)
 *       - Genera recomendaciones accionables para administradores
 *       
 *       **Outputs generados:**
 *       - Archivo CSV con datos procesados y limpios
 *       - Modelo de ML serializado (.joblib) para uso posterior
 *       - Gráficos de visualización de zonas críticas
 *       - Reporte JSON con métricas y recomendaciones
 *       
 *       **Casos de uso:**
 *       - Análisis de tendencias de problemática urbana
 *       - Identificación de zonas que requieren atención prioritaria
 *       - Planificación preventiva de mantenimiento urbano
 *       - Optimización de recursos municipales
 *       - Generación de reportes de transparencia ciudadana
 *     tags: [🛠️ Utils]
 *     responses:
 *       200:
 *         description: ✅ Proceso ETL y análisis completado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ETLResponse'
 *             examples:
 *               modelo_hibrido_completo:
 *                 summary: Modelo híbrido con predicciones y recomendaciones
 *                 description: Proceso completo con clustering + predicción temporal
 *                 value:
 *                   success: true
 *                   message: "ETL y modelo ejecutados exitosamente"
 *                   version: "hibrido_v2.1"
 *                   data:
 *                     archivo_csv: "exports/etl_data/etl_reportes_limpios_20250810_154022.csv"
 *                     modelo_path: "modelos/zonas_criticas_avanzado_20250810_154045.joblib"
 *                     grafico_path: "graficos/zonas_criticas_avanzado_20250810_154045.png"
 *                     metricas:
 *                       silhouette_score: 0.742
 *                       n_clusters: 4
 *                       prediccion:
 *                         mae: 2.34
 *                         r2: 0.651
 *                       zonas_con_prediccion: 4
 *                       total_recomendaciones: 12
 *                     estadisticas_etl:
 *                       registros_procesados: "969207"
 *                       reportes_alta_prioridad: "412087"
 *                       tasa_retencion: "96.9%"
 *                     modelo_hibrido:
 *                       predicciones_futuras:
 *                         "Zona 0":
 *                           - semana: 1
 *                             fecha: "2025-08-17"
 *                             reportes_predichos: 12
 *                           - semana: 2
 *                             fecha: "2025-08-24"
 *                             reportes_predichos: 15
 *                         "Zona 1":
 *                           - semana: 1
 *                             fecha: "2025-08-17"
 *                             reportes_predichos: 8
 *                       recomendaciones:
 *                         - zona: "Zona 0"
 *                           accion: "Reforzar atención preventiva - Se esperan 12 reportes"
 *                           prioridad: "ALTA"
 *                           coordenadas: "(20.2750, -97.9550)"
 *                         - zona: "Zona 1"
 *                           accion: "Monitoreo regular - Actividad moderada esperada"
 *                           prioridad: "MEDIA"
 *                           coordenadas: "(20.2650, -97.9600)"
 *                   timestamp: "2024-08-10T15:40:45Z"
 *               modelo_clustering_basico:
 *                 summary: Modelo de clustering sin predicciones
 *                 description: Análisis geográfico básico sin componente temporal
 *                 value:
 *                   success: true
 *                   message: "ETL y modelo ejecutados exitosamente"
 *                   version: "clustering_v1.0"
 *                   data:
 *                     archivo_csv: "exports/etl_data/etl_reportes_limpios_20250810_160022.csv"
 *                     modelo_path: "modelos/zonas_criticas_basico_20250810_160045.joblib"
 *                     grafico_path: "graficos/zonas_criticas_basico_20250810_160045.png"
 *                     metricas:
 *                       silhouette_score: 0.683
 *                       n_clusters: 3
 *                     estadisticas_etl:
 *                       registros_procesados: "1204876"
 *                       reportes_alta_prioridad: "523901"
 *                       tasa_retencion: "98.2%"
 *               dataset_pequeno:
 *                 summary: Análisis con dataset reducido
 *                 description: Resultado típico con pocos datos disponibles
 *                 value:
 *                   success: true
 *                   message: "ETL y modelo ejecutados exitosamente"
 *                   version: "avanzado_v2.1"
 *                   data:
 *                     archivo_csv: "exports/etl_data/etl_reportes_limpios_20250810_170022.csv"
 *                     modelo_path: "modelos/zonas_criticas_avanzado_20250810_170045.joblib"
 *                     grafico_path: "graficos/zonas_criticas_avanzado_20250810_170045.png"
 *                     metricas:
 *                       silhouette_score: 0.456
 *                       n_clusters: 2
 *                     estadisticas_etl:
 *                       registros_procesados: "1247"
 *                       reportes_alta_prioridad: "523"
 *                       tasa_retencion: "94.1%"
 *                     warnings: ["Dataset pequeño: recomendamos más de 10,000 reportes para mejores predicciones"]
 *       500:
 *         description: ❌ Error durante el proceso ETL o análisis
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UtilsErrorResponse'
 *             examples:
 *               error_etl:
 *                 summary: Error durante la fase ETL
 *                 description: Fallo en extracción o transformación de datos
 *                 value:
 *                   success: false
 *                   etapa: "ETL"
 *                   error:
 *                     message: "Database connection failed"
 *                     code: "DB_CONNECTION_ERROR"
 *                     detalles: "psycopg2.OperationalError: could not connect to server"
 *                   timestamp: "2024-08-10T15:30:00Z"
 *               error_modelo:
 *                 summary: Error durante el análisis de ML
 *                 description: Fallo en clustering o predicción
 *                 value:
 *                   success: false
 *                   etapa: "Modelo"
 *                   archivo_csv: "exports/etl_data/etl_reportes_limpios_20250810_154022.csv"
 *                   error:
 *                     message: "Insufficient data for clustering"
 *                     detalles: "Se requieren al menos 100 reportes válidos para análisis"
 *                   timestamp: "2024-08-10T15:35:00Z"
 *               error_memoria:
 *                 summary: Error de memoria insuficiente
 *                 description: Dataset demasiado grande para recursos disponibles
 *                 value:
 *                   success: false
 *                   etapa: "Modelo"
 *                   error:
 *                     message: "MemoryError during model training"
 *                     detalles: "Dataset con 5M+ registros requiere más RAM"
 *                   timestamp: "2024-08-10T15:45:00Z"
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