const express = require('express');
const router = express.Router();
const votosController = require('../controllers/votosController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     VotoRequest:
 *       type: object
 *       required:
 *         - reporte_id
 *       properties:
 *         reporte_id:
 *           type: integer
 *           minimum: 1
 *           description: ID único del reporte a votar
 *           example: 456
 *     
 *     VotoResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Voto registrado correctamente"
 *         data:
 *           type: object
 *           properties:
 *             voto_id:
 *               type: integer
 *               description: ID único del voto registrado
 *               example: 789
 *             reporte_id:
 *               type: integer
 *               description: ID del reporte votado
 *               example: 456
 *             usuario_id:
 *               type: integer
 *               description: ID del usuario que votó
 *               example: 123
 *             tipo_voto:
 *               type: string
 *               enum: [up, down, none]
 *               description: Tipo de voto registrado
 *               example: "up"
 *             accion:
 *               type: string
 *               enum: [creado, actualizado, eliminado]
 *               description: Acción realizada en el sistema
 *               example: "creado"
 *             fecha_voto:
 *               type: string
 *               format: date-time
 *               description: Timestamp del voto
 *               example: "2024-08-10T16:30:00Z"
 *             conteos_actualizados:
 *               type: object
 *               properties:
 *                 votos_up:
 *                   type: integer
 *                   description: Total de votos positivos del reporte
 *                   example: 24
 *                 votos_down:
 *                   type: integer
 *                   description: Total de votos negativos del reporte
 *                   example: 3
 *                 voto_neto:
 *                   type: integer
 *                   description: Diferencia entre votos positivos y negativos
 *                   example: 21
 *                 puntuacion_popularidad:
 *                   type: number
 *                   format: float
 *                   description: Puntuación calculada de popularidad (0-100)
 *                   example: 87.5
 *     
 *     VotosEstadisticasResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             reporte_id:
 *               type: integer
 *               example: 456
 *             conteos:
 *               type: object
 *               properties:
 *                 votos_up:
 *                   type: integer
 *                   description: Total de votos positivos
 *                   example: 24
 *                 votos_down:
 *                   type: integer
 *                   description: Total de votos negativos
 *                   example: 3
 *                 total_votos:
 *                   type: integer
 *                   description: Total de votos emitidos
 *                   example: 27
 *                 voto_neto:
 *                   type: integer
 *                   description: Diferencia (up - down)
 *                   example: 21
 *             metricas:
 *               type: object
 *               properties:
 *                 porcentaje_aprobacion:
 *                   type: number
 *                   format: float
 *                   description: Porcentaje de votos positivos
 *                   example: 88.9
 *                 puntuacion_popularidad:
 *                   type: number
 *                   format: float
 *                   description: Puntuación de popularidad (0-100)
 *                   example: 87.5
 *                 nivel_consenso:
 *                   type: string
 *                   enum: [muy_alto, alto, medio, bajo, muy_bajo]
 *                   description: Nivel de consenso ciudadano
 *                   example: "muy_alto"
 *                 ranking_categoria:
 *                   type: integer
 *                   description: Posición en ranking de su categoría
 *                   example: 3
 *             mi_voto:
 *               type: object
 *               nullable: true
 *               description: Voto del usuario autenticado (si existe)
 *               properties:
 *                 tipo:
 *                   type: string
 *                   enum: [up, down]
 *                   example: "up"
 *                 fecha:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-08-10T16:30:00Z"
 *             ultimos_votantes:
 *               type: array
 *               description: Últimos 5 usuarios que votaron (solo nombres)
 *               items:
 *                 type: object
 *                 properties:
 *                   nombre:
 *                     type: string
 *                     example: "María G."
 *                   tipo_voto:
 *                     type: string
 *                     enum: [up, down]
 *                     example: "up"
 *                   fecha:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-08-10T16:25:00Z"
 *     
 *     VotoErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Error al registrar el voto"
 *         error:
 *           type: string
 *           example: "REPORT_NOT_FOUND"
 *         detalles:
 *           type: string
 *           example: "El reporte especificado no existe o fue eliminado"
 */

/**
 * @swagger
 * tags:
 *   name: 👍 Votos
 */
/**
 * @swagger
 * /api/votos/up:
 *   post:
 *     summary: Votar positivamente un reporte (upvote)
 *     description: |
 *       Permite al usuario registrar un voto positivo en un reporte, indicando que está de acuerdo con el problema reportado o considera que es importante y requiere atención.
 *       
 *       **Funcionalidad del sistema de votos:**
 *       - Sistema democrático para priorizar reportes según relevancia ciudadana
 *       - Un voto por usuario por reporte (se puede cambiar o anular)
 *       - Influye en algoritmos de ordenamiento y visibilidad
 *       - Contribuye al sistema de reputación del autor del reporte
 *       - Genera métricas de consenso y popularidad ciudadana
 *       
 *       **Comportamiento del voto positivo:**
 *       - Si no hay voto previo: crea nuevo voto "up"
 *       - Si ya votó "down": cambia a voto "up"
 *       - Si ya votó "up": elimina el voto (queda neutral)
 *       - Actualiza contadores en tiempo real
 *       - Recalcula métricas de popularidad automáticamente
 *       
 *       **Impacto en el sistema:**
 *       - Aumenta la puntuación de popularidad del reporte
 *       - Mejora la posición en rankings de tendencias
 *       - Incrementa la reputación del autor (+2 puntos)
 *       - Contribuye a algoritmos de recomendación
 *       - Influye en notificaciones a autoridades
 *       
 *       **Casos de uso:**
 *       - Ciudadano confirma que también observó el problema
 *       - Usuario considera el reporte importante para la comunidad
 *       - Apoyo a reportes bien documentados y precisos
 *       - Priorización democrática de problemas urbanos
 *       - Validación comunitaria de reportes legítimos
 *     tags: [👍 Votos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VotoRequest'
 *           examples:
 *             voto_nuevo:
 *               summary: Votando por primera vez un reporte
 *               description: Usuario emite su primer voto en este reporte
 *               value:
 *                 reporte_id: 456
 *             cambio_voto:
 *               summary: Cambiando voto de negativo a positivo
 *               description: Usuario que había votado down ahora vota up
 *               value:
 *                 reporte_id: 789
 *             anular_voto:
 *               summary: Anulando voto positivo existente
 *               description: Usuario retira su voto positivo previo
 *               value:
 *                 reporte_id: 321
 *     responses:
 *       201:
 *         description: ✅ Voto positivo registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VotoResponse'
 *             examples:
 *               voto_creado:
 *                 summary: Nuevo voto positivo registrado
 *                 value:
 *                   success: true
 *                   message: "¡Gracias por tu voto! Has apoyado este reporte que ahora tiene mayor visibilidad."
 *                   data:
 *                     voto_id: 789
 *                     reporte_id: 456
 *                     usuario_id: 123
 *                     tipo_voto: "up"
 *                     accion: "creado"
 *                     fecha_voto: "2024-08-10T16:30:00Z"
 *                     conteos_actualizados:
 *                       votos_up: 24
 *                       votos_down: 3
 *                       voto_neto: 21
 *                       puntuacion_popularidad: 87.5
 *       200:
 *         description: ✅ Voto actualizado o eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VotoResponse'
 *             examples:
 *               voto_cambiado:
 *                 summary: Voto cambiado de negativo a positivo
 *                 value:
 *                   success: true
 *                   message: "Has cambiado tu voto a positivo. ¡Gracias por reconsiderar este reporte!"
 *                   data:
 *                     voto_id: 789
 *                     reporte_id: 456
 *                     usuario_id: 123
 *                     tipo_voto: "up"
 *                     accion: "actualizado"
 *                     fecha_voto: "2024-08-10T16:35:00Z"
 *                     conteos_actualizados:
 *                       votos_up: 24
 *                       votos_down: 2
 *                       voto_neto: 22
 *                       puntuacion_popularidad: 91.7
 *               voto_eliminado:
 *                 summary: Voto positivo anulado
 *                 value:
 *                   success: true
 *                   message: "Has retirado tu voto positivo. El reporte vuelve a estado neutral para ti."
 *                   data:
 *                     reporte_id: 456
 *                     usuario_id: 123
 *                     tipo_voto: "none"
 *                     accion: "eliminado"
 *                     fecha_voto: "2024-08-10T16:40:00Z"
 *                     conteos_actualizados:
 *                       votos_up: 23
 *                       votos_down: 3
 *                       voto_neto: 20
 *                       puntuacion_popularidad: 86.2
 *       400:
 *         description: ❌ Error en los datos del voto
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VotoErrorResponse'
 *             examples:
 *               reporte_id_invalido:
 *                 summary: ID de reporte inválido
 *                 value:
 *                   success: false
 *                   message: "ID de reporte inválido"
 *                   error: "INVALID_REPORT_ID"
 *                   detalles: "El reporte_id debe ser un número entero positivo"
 *               reporte_cerrado:
 *                 summary: Reporte cerrado no se puede votar
 *                 value:
 *                   success: false
 *                   message: "No se puede votar en reportes cerrados"
 *                   error: "REPORT_CLOSED"
 *                   detalles: "Los reportes en estado 'cerrado' no admiten más votos"
 *       401:
 *         description: ❌ Token de autenticación requerido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VotoErrorResponse'
 *             examples:
 *               no_autenticado:
 *                 summary: Usuario no autenticado
 *                 value:
 *                   success: false
 *                   message: "Debes iniciar sesión para votar"
 *                   error: "AUTHENTICATION_REQUIRED"
 *       403:
 *         description: ❌ No autorizado para votar
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VotoErrorResponse'
 *             examples:
 *               voto_propio_reporte:
 *                 summary: No se puede votar el propio reporte
 *                 value:
 *                   success: false
 *                   message: "No puedes votar en tus propios reportes"
 *                   error: "CANNOT_VOTE_OWN_REPORT"
 *                   detalles: "Los autores no pueden votar en sus propios reportes para mantener imparcialidad"
 *               cuenta_suspendida:
 *                 summary: Cuenta con restricciones de votación
 *                 value:
 *                   success: false
 *                   message: "Tu cuenta tiene restricciones para votar"
 *                   error: "VOTING_RESTRICTED"
 *                   detalles: "Contacta a soporte para más información"
 *       404:
 *         description: ❌ Reporte no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VotoErrorResponse'
 *             examples:
 *               reporte_inexistente:
 *                 summary: Reporte no existe
 *                 value:
 *                   success: false
 *                   message: "El reporte especificado no existe"
 *                   error: "REPORT_NOT_FOUND"
 *                   detalles: "No se encontró un reporte con ID 999"
 *       500:
 *         description: ❌ Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VotoErrorResponse'
 *             examples:
 *               error_base_datos:
 *                 summary: Error en base de datos
 *                 value:
 *                   success: false
 *                   message: "Error interno al procesar el voto"
 *                   error: "DATABASE_ERROR"
 *                   detalles: "Error temporal en el sistema. Intenta nuevamente."
 */
router.post('/up', auth, votosController.votarUp);

/**
 * @swagger
 * /api/votos/down:
 *   post:
 *     summary: Votar negativamente un reporte (downvote)
 *     description: |
 *       Permite al usuario registrar un voto negativo en un reporte, indicando que considera que el reporte no es relevante, está mal documentado o no refleja un problema real.
 *       
 *       **Propósito del voto negativo:**
 *       - Mecanismo de control de calidad comunitario
 *       - Filtro democrático para reportes irrelevantes o falsos
 *       - Herramienta para combatir spam o contenido inapropiado
 *       - Sistema de autorregulación ciudadana
 *       - Mejora la calidad general de la plataforma
 *       
 *       **Comportamiento del voto negativo:**
 *       - Si no hay voto previo: crea nuevo voto "down"
 *       - Si ya votó "up": cambia a voto "down"
 *       - Si ya votó "down": elimina el voto (queda neutral)
 *       - Reduce contadores y métricas de popularidad
 *       - Puede afectar la visibilidad del reporte
 *       
 *       **Impacto en el sistema:**
 *       - Disminuye la puntuación de popularidad del reporte
 *       - Baja la posición en rankings de relevancia
 *       - Puede reducir la reputación del autor (-1 punto)
 *       - Influye en algoritmos de detección de contenido de baja calidad
 *       - Activa revisiones automáticas si acumula muchos votos negativos
 *       
 *       **Uso responsable:**
 *       - Solo para reportes genuinamente problemáticos
 *       - No usar por desacuerdos personales con el autor
 *       - Considerar comentar para explicar el problema
 *       - Alternativa: reportar contenido inapropiado a moderadores
 *       - Recordar que afecta a un miembro de la comunidad
 *       
 *       **Casos de uso apropiados:**
 *       - Reporte de problema que claramente no existe
 *       - Información incorrecta o engañosa
 *       - Spam o contenido fuera de tema
 *       - Duplicado de reporte ya existente
 *       - Lenguaje inapropiado u ofensivo
 *     tags: [👍 Votos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VotoRequest'
 *           examples:
 *             voto_calidad:
 *               summary: Votando negativamente por calidad del reporte
 *               description: Reporte mal documentado o información incorrecta
 *               value:
 *                 reporte_id: 456
 *             voto_spam:
 *               summary: Votando negativamente por spam
 *               description: Contenido repetitivo o irrelevante
 *               value:
 *                 reporte_id: 789
 *             cambio_opinion:
 *               summary: Cambiando de voto positivo a negativo
 *               description: Usuario reconsideró su voto inicial
 *               value:
 *                 reporte_id: 321
 *     responses:
 *       201:
 *         description: ✅ Voto negativo registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VotoResponse'
 *             examples:
 *               voto_negativo_creado:
 *                 summary: Nuevo voto negativo registrado
 *                 value:
 *                   success: true
 *                   message: "Tu voto negativo ha sido registrado. Esto ayuda a mantener la calidad de la plataforma."
 *                   data:
 *                     voto_id: 890
 *                     reporte_id: 456
 *                     usuario_id: 123
 *                     tipo_voto: "down"
 *                     accion: "creado"
 *                     fecha_voto: "2024-08-10T16:45:00Z"
 *                     conteos_actualizados:
 *                       votos_up: 15
 *                       votos_down: 8
 *                       voto_neto: 7
 *                       puntuacion_popularidad: 65.2
 *       200:
 *         description: ✅ Voto negativo actualizado o eliminado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VotoResponse'
 *             examples:
 *               voto_cambiado_negativo:
 *                 summary: Voto cambiado de positivo a negativo
 *                 value:
 *                   success: true
 *                   message: "Has cambiado tu voto a negativo. Tu feedback ayuda a mejorar la calidad."
 *                   data:
 *                     voto_id: 890
 *                     reporte_id: 456
 *                     usuario_id: 123
 *                     tipo_voto: "down"
 *                     accion: "actualizado"
 *                     fecha_voto: "2024-08-10T16:50:00Z"
 *                     conteos_actualizados:
 *                       votos_up: 14
 *                       votos_down: 9
 *                       voto_neto: 5
 *                       puntuacion_popularidad: 60.9
 *               voto_negativo_eliminado:
 *                 summary: Voto negativo anulado
 *                 value:
 *                   success: true
 *                   message: "Has retirado tu voto negativo. El reporte vuelve a estado neutral."
 *                   data:
 *                     reporte_id: 456
 *                     usuario_id: 123
 *                     tipo_voto: "none"
 *                     accion: "eliminado"
 *                     fecha_voto: "2024-08-10T16:55:00Z"
 *                     conteos_actualizados:
 *                       votos_up: 15
 *                       votos_down: 7
 *                       voto_neto: 8
 *                       puntuacion_popularidad: 68.2
 *       400:
 *         description: ❌ Error en los datos del voto
 *       401:
 *         description: ❌ Token de autenticación requerido
 *       403:
 *         description: ❌ No autorizado para votar
 *       404:
 *         description: ❌ Reporte no encontrado
 *       500:
 *         description: ❌ Error interno del servidor
 */
router.post('/down', auth, votosController.votarDown);


/**
 * @swagger
 * /api/votos/{reporte_id}:
 *   get:
 *     summary: Obtener estadísticas completas de votos de un reporte
 *     description: |
 *       Proporciona información detallada sobre la votación de un reporte específico, incluyendo conteos, métricas de popularidad y análisis de consenso ciudadano.
 *       
 *       **Información proporcionada:**
 *       - Conteos exactos de votos positivos y negativos
 *       - Métricas calculadas de popularidad y consenso
 *       - Voto personal del usuario (si está autenticado)
 *       - Historial reciente de votantes (anonimizado)
 *       - Posición en rankings de categoría
 *       
 *       **Métricas de consenso:**
 *       - **Muy Alto (>90% aprobación):** Problema ampliamente reconocido
 *       - **Alto (70-90% aprobación):** Consenso sólido de la comunidad
 *       - **Medio (50-70% aprobación):** Opinión dividida pero positiva
 *       - **Bajo (30-50% aprobación):** Controversia o relevancia cuestionada
 *       - **Muy Bajo (<30% aprobación):** Rechazo comunitario significativo
 *       
 *       **Puntuación de popularidad:**
 *       - Algoritmo que considera votos, tiempo y participación
 *       - Escala 0-100 (100 = máxima popularidad)
 *       - Influye en ordenamiento y visibilidad
 *       - Se actualiza en tiempo real con cada voto
 *       - Decae gradualmente con el tiempo
 *       
 *       **Casos de uso:**
 *       - Dashboards de administración y análisis
 *       - Interfaces de usuario para mostrar popularidad
 *       - Algoritmos de recomendación y ranking
 *       - Análisis de tendencias y comportamiento ciudadano
 *       - Sistemas de notificación basados en popularidad
 *     tags: [👍 Votos]
 *     parameters:
 *       - in: path
 *         name: reporte_id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID único del reporte para consultar estadísticas
 *         example: 456
 *       - in: header
 *         name: Authorization
 *         required: false
 *         schema:
 *           type: string
 *         description: Token Bearer para mostrar voto personal (opcional)
 *         example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: ✅ Estadísticas de votos obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VotosEstadisticasResponse'
 *             examples:
 *               reporte_popular:
 *                 summary: Reporte con alto consenso positivo
 *                 description: Reporte bien valorado por la comunidad
 *                 value:
 *                   success: true
 *                   data:
 *                     reporte_id: 456
 *                     conteos:
 *                       votos_up: 47
 *                       votos_down: 3
 *                       total_votos: 50
 *                       voto_neto: 44
 *                     metricas:
 *                       porcentaje_aprobacion: 94.0
 *                       puntuacion_popularidad: 92.8
 *                       nivel_consenso: "muy_alto"
 *                       ranking_categoria: 1
 *                     mi_voto:
 *                       tipo: "up"
 *                       fecha: "2024-08-10T14:30:00Z"
 *                     ultimos_votantes:
 *                       - nombre: "Carlos M."
 *                         tipo_voto: "up"
 *                         fecha: "2024-08-10T16:45:00Z"
 *                       - nombre: "Ana L."
 *                         tipo_voto: "up"
 *                         fecha: "2024-08-10T16:30:00Z"
 *                       - nombre: "José R."
 *                         tipo_voto: "up"
 *                         fecha: "2024-08-10T16:15:00Z"
 *               reporte_controversial:
 *                 summary: Reporte con opinión dividida
 *                 description: Reporte que genera debate en la comunidad
 *                 value:
 *                   success: true
 *                   data:
 *                     reporte_id: 789
 *                     conteos:
 *                       votos_up: 23
 *                       votos_down: 18
 *                       total_votos: 41
 *                       voto_neto: 5
 *                     metricas:
 *                       porcentaje_aprobacion: 56.1
 *                       puntuacion_popularidad: 48.3
 *                       nivel_consenso: "medio"
 *                       ranking_categoria: 12
 *                     mi_voto: null
 *                     ultimos_votantes:
 *                       - nombre: "Laura P."
 *                         tipo_voto: "down"
 *                         fecha: "2024-08-10T16:40:00Z"
 *                       - nombre: "Miguel S."
 *                         tipo_voto: "up"
 *                         fecha: "2024-08-10T16:25:00Z"
 *               reporte_nuevo_sin_votos:
 *                 summary: Reporte recién creado sin votos
 *                 description: Reporte que aún no ha recibido votación
 *                 value:
 *                   success: true
 *                   data:
 *                     reporte_id: 999
 *                     conteos:
 *                       votos_up: 0
 *                       votos_down: 0
 *                       total_votos: 0
 *                       voto_neto: 0
 *                     metricas:
 *                       porcentaje_aprobacion: 0.0
 *                       puntuacion_popularidad: 0.0
 *                       nivel_consenso: "sin_datos"
 *                       ranking_categoria: null
 *                     mi_voto: null
 *                     ultimos_votantes: []
 *               usuario_no_autenticado:
 *                 summary: Consulta sin autenticación
 *                 description: Estadísticas públicas sin mostrar voto personal
 *                 value:
 *                   success: true
 *                   data:
 *                     reporte_id: 456
 *                     conteos:
 *                       votos_up: 47
 *                       votos_down: 3
 *                       total_votos: 50
 *                       voto_neto: 44
 *                     metricas:
 *                       porcentaje_aprobacion: 94.0
 *                       puntuacion_popularidad: 92.8
 *                       nivel_consenso: "muy_alto"
 *                       ranking_categoria: 1
 *                     mi_voto: null
 *                     ultimos_votantes:
 *                       - nombre: "Carlos M."
 *                         tipo_voto: "up"
 *                         fecha: "2024-08-10T16:45:00Z"
 *       404:
 *         description: ❌ Reporte no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VotoErrorResponse'
 *             examples:
 *               reporte_inexistente:
 *                 summary: ID de reporte no válido
 *                 value:
 *                   success: false
 *                   message: "No se encontró el reporte especificado"
 *                   error: "REPORT_NOT_FOUND"
 *                   detalles: "No existe un reporte con ID 999"
 *       500:
 *         description: ❌ Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VotoErrorResponse'
 *             examples:
 *               error_consulta:
 *                 summary: Error al consultar estadísticas
 *                 value:
 *                   success: false
 *                   message: "Error al obtener estadísticas de votos"
 *                   error: "QUERY_ERROR"
 *                   detalles: "Error temporal en el sistema. Intenta nuevamente."
 */
router.get('/:reporte_id', votosController.getVotosPorReporte);

module.exports = router;