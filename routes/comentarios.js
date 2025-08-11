const express = require('express');
const router = express.Router();
const comentariosController = require('../controllers/comentarioController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Comentario:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del comentario
 *           example: 1
 *         texto:
 *           type: string
 *           description: Contenido del comentario del usuario
 *           example: "Excelente reporte, confirmo que este problema afecta a toda la cuadra. Espero que las autoridades tomen acción pronto."
 *         usuario_id:
 *           type: integer
 *           description: ID del usuario que escribió el comentario
 *           example: 123
 *         reporte_id:
 *           type: integer
 *           description: ID del reporte al que pertenece el comentario
 *           example: 456
 *         fecha_creacion:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de creación del comentario
 *           example: "2024-08-08T14:30:00Z"
 *         fecha_actualizacion:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de última edición del comentario
 *           example: "2024-08-08T15:45:00Z"
 *         editado:
 *           type: boolean
 *           description: Indica si el comentario ha sido editado después de su creación
 *           example: true
 *         usuario:
 *           type: object
 *           description: Información básica del autor del comentario
 *           properties:
 *             id:
 *               type: integer
 *               example: 123
 *             nombre:
 *               type: string
 *               example: "María González"
 *             rol:
 *               type: string
 *               enum: [ciudadano, admin]
 *               example: "ciudadano"
 *             puntos:
 *               type: integer
 *               description: Puntos de reputación del usuario
 *               example: 150
 *     
 *     ComentarioRequest:
 *       type: object
 *       required:
 *         - reporte_id
 *         - texto
 *       properties:
 *         reporte_id:
 *           type: integer
 *           minimum: 1
 *           description: ID del reporte al que se va a comentar (debe existir y estar activo)
 *           example: 456
 *         texto:
 *           type: string
 *           minLength: 10
 *           maxLength: 1000
 *           description: Contenido del comentario (10-1000 caracteres, sin palabras ofensivas)
 *           example: "Confirmo este problema. Llevo 3 semanas reportando la misma situación a través de diferentes canales. Es urgente que se solucione."
 *     
 *     ComentarioUpdateRequest:
 *       type: object
 *       required:
 *         - texto
 *       properties:
 *         texto:
 *           type: string
 *           minLength: 10
 *           maxLength: 1000
 *           description: Nuevo contenido del comentario (10-1000 caracteres)
 *           example: "Actualizo mi comentario: después de hablar con más vecinos, confirmo que el problema es aún más grave de lo que pensaba inicialmente."
 *     
 *     ComentariosResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indica si la operación fue exitosa
 *           example: true
 *         message:
 *           type: string
 *           description: Mensaje descriptivo del resultado
 *           example: "Comentarios obtenidos correctamente"
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Comentario'
 *         total:
 *           type: integer
 *           description: Número total de comentarios en el reporte
 *           example: 12
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: integer
 *               example: 1
 *             limit:
 *               type: integer
 *               example: 10
 *             totalPages:
 *               type: integer
 *               example: 2
 *     
 *     ComentarioResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Comentario procesado correctamente"
 *         data:
 *           $ref: '#/components/schemas/Comentario'
 */

/**
 * @swagger
 * /api/comentarios:
 *   post:
 *     summary: Crear nuevo comentario en un reporte
 *     description: |
 *       Permite a usuarios autenticados (ciudadanos y administradores) agregar comentarios a reportes existentes.
 *       
 *       **Funcionalidad:**
 *       - Crea un nuevo comentario asociado a un reporte específico
 *       - Valida que el reporte existe y está activo para comentarios
 *       - Registra automáticamente el usuario autor y timestamp
 *       - Aplica filtro de contenido ofensivo
 *       - Actualiza estadísticas de participación del usuario
 *       - Envía notificaciones en tiempo real via WebSocket
 *       
 *       **Validaciones aplicadas:**
 *       - Usuario debe estar autenticado
 *       - Reporte debe existir y no estar cerrado
 *       - Texto entre 10-1000 caracteres
 *       - Filtro anti-spam (máximo 5 comentarios por hora por usuario)
 *       - Detección de palabras ofensivas
 *       
 *       **Notificaciones automáticas:**
 *       - Al autor del reporte (si no es el mismo usuario)
 *       - A administradores si el reporte es de alta prioridad
 *       - A usuarios que han comentado previamente en el reporte
 *       
 *       **Casos de uso:**
 *       - Ciudadano agregando información adicional a un reporte
 *       - Administrador respondiendo o pidiendo aclaraciones
 *       - Vecinos confirmando o complementando información
 *       - Seguimiento de progreso en resolución de problemas
 *     tags: [💬 Comentarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ComentarioRequest'
 *           examples:
 *             comentario_ciudadano:
 *               summary: Comentario de ciudadano apoyando reporte
 *               description: Ciudadano confirmando y agregando información
 *               value:
 *                 reporte_id: 456
 *                 texto: "Confirmo este problema en la Calle Hidalgo. La situación ha empeorado desde la semana pasada y ahora afecta el paso de vehículos. Varios vecinos estamos preocupados por la seguridad."
 *             comentario_admin:
 *               summary: Respuesta de administrador municipal
 *               description: Administrador dando seguimiento oficial
 *               value:
 *                 reporte_id: 456
 *                 texto: "Estimados ciudadanos, hemos recibido su reporte y ya se programó la visita técnica para el próximo lunes 12 de agosto. Mantendremos informada a la comunidad sobre los avances."
 *             comentario_seguimiento:
 *               summary: Comentario de seguimiento
 *               description: Usuario dando actualización sobre el problema
 *               value:
 *                 reporte_id: 456
 *                 texto: "Actualización: El problema persiste después de 2 semanas. ¿Hay alguna fecha estimada para la reparación? Los vecinos seguimos esperando una solución."
 *             comentario_informativo:
 *               summary: Información adicional útil
 *               value:
 *                 reporte_id: 456
 *                 texto: "Para complementar el reporte: el problema es más grave en las mañanas (7-9 AM) cuando hay más tráfico. También afecta el acceso al mercado municipal los días de tianguis."
 *     responses:
 *       201:
 *         description: ✅ Comentario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ComentarioResponse'
 *             examples:
 *               comentario_creado:
 *                 summary: Comentario agregado correctamente
 *                 value:
 *                   success: true
 *                   message: "Comentario agregado exitosamente. Las partes interesadas han sido notificadas."
 *                   data:
 *                     id: 789
 *                     texto: "Confirmo este problema en la Calle Hidalgo. La situación ha empeorado desde la semana pasada."
 *                     usuario_id: 123
 *                     reporte_id: 456
 *                     fecha_creacion: "2024-08-08T14:30:00Z"
 *                     fecha_actualizacion: "2024-08-08T14:30:00Z"
 *                     editado: false
 *                     usuario:
 *                       id: 123
 *                       nombre: "María González"
 *                       rol: "ciudadano"
 *                       puntos: 155
 *       400:
 *         description: ❌ Error en los datos proporcionados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               reporte_inexistente:
 *                 summary: Reporte no existe
 *                 value:
 *                   success: false
 *                   message: "No se encontró un reporte activo con ID 999"
 *                   error: "REPORT_NOT_FOUND"
 *               reporte_cerrado:
 *                 summary: Reporte cerrado para comentarios
 *                 value:
 *                   success: false
 *                   message: "Este reporte está cerrado y no acepta más comentarios"
 *                   error: "REPORT_CLOSED_FOR_COMMENTS"
 *               texto_muy_corto:
 *                 summary: Comentario demasiado breve
 *                 value:
 *                   success: false
 *                   message: "El comentario debe tener al menos 10 caracteres para ser útil"
 *                   error: "COMMENT_TOO_SHORT"
 *               contenido_inapropiado:
 *                 summary: Contenido filtrado por el sistema
 *                 value:
 *                   success: false
 *                   message: "El comentario contiene lenguaje inapropiado. Por favor, reformula tu mensaje de manera respetuosa"
 *                   error: "INAPPROPRIATE_CONTENT"
 *       401:
 *         description: ❌ Token de autenticación requerido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               sin_autenticacion:
 *                 summary: Usuario no autenticado
 *                 value:
 *                   success: false
 *                   message: "Debes iniciar sesión para comentar en reportes"
 *                   error: "AUTHENTICATION_REQUIRED"
 *       422:
 *         description: ❌ Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validacion_fallo:
 *                 summary: Error en validación de campos
 *                 value:
 *                   success: false
 *                   message: "El campo reporte_id es obligatorio y debe ser un número entero positivo"
 *                   error: "VALIDATION_ERROR"
 *       429:
 *         description: ❌ Límite de comentarios excedido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               spam_protection:
 *                 summary: Protección anti-spam activada
 *                 value:
 *                   success: false
 *                   message: "Has alcanzado el límite de 5 comentarios por hora. Intenta de nuevo más tarde"
 *                   error: "COMMENT_RATE_LIMIT_EXCEEDED"
 *       500:
 *         description: ❌ Error interno del servidor
 */
router.post('/', auth, comentariosController.createComentario);

/**
 * @swagger
 * /api/comentarios/{reporte_id}:
 *   get:
 *     summary: Obtener todos los comentarios de un reporte específico
 *     description: |
 *       Retorna la lista completa de comentarios asociados a un reporte, ordenados cronológicamente.
 *       
 *       **Funcionalidad:**
 *       - Obtiene comentarios de un reporte específico
 *       - Incluye información del usuario autor de cada comentario
 *       - Ordenados del más reciente al más antiguo
 *       - Incluye indicador de comentarios editados
 *       - Endpoint público (no requiere autenticación)
 *       - Soporte para paginación en reportes con muchos comentarios
 *       
 *       **Información incluida:**
 *       - Texto completo de cada comentario
 *       - Datos básicos del autor (nombre, rol, puntos)
 *       - Timestamps de creación y edición
 *       - Indicador visual de comentarios editados
 *       - Estadísticas de participación
 *       
 *       **Casos de uso:**
 *       - Mostrar discusión completa en la vista del reporte
 *       - Seguimiento de conversación entre ciudadanos y autoridades
 *       - Historial de actualizaciones sobre el problema
 *       - Análisis de participación ciudadana
 *       - Feed de actividad reciente
 *       
 *       **Consideraciones de rendimiento:**
 *       - Paginación automática para reportes con >50 comentarios
 *       - Cache de 5 minutos para comentarios estables
 *       - Optimización de consultas con JOIN eficiente
 *     tags: [💬 Comentarios]
 *     parameters:
 *       - in: path
 *         name: reporte_id
 *         schema:
 *           type: integer
 *           minimum: 1
 *         required: true
 *         description: ID único del reporte del cual obtener los comentarios
 *         example: 456
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página para paginación (opcional)
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 5
 *           maximum: 50
 *           default: 10
 *         description: Número máximo de comentarios por página (5-50)
 *         example: 10
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest]
 *           default: newest
 *         description: Orden de los comentarios (newest=más recientes primero)
 *         example: newest
 *     responses:
 *       200:
 *         description: ✅ Comentarios obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ComentariosResponse'
 *             examples:
 *               comentarios_activos:
 *                 summary: Reporte con discusión activa
 *                 description: Reporte con múltiples comentarios de diferentes usuarios
 *                 value:
 *                   success: true
 *                   message: "12 comentarios encontrados para el reporte #456"
 *                   total: 12
 *                   pagination:
 *                     page: 1
 *                     limit: 10
 *                     totalPages: 2
 *                   data:
 *                     - id: 789
 *                       texto: "Actualización: El problema persiste después de 2 semanas"
 *                       usuario_id: 123
 *                       reporte_id: 456
 *                       fecha_creacion: "2024-08-08T14:30:00Z"
 *                       fecha_actualizacion: "2024-08-08T15:45:00Z"
 *                       editado: true
 *                       usuario:
 *                         id: 123
 *                         nombre: "María González"
 *                         rol: "ciudadano"
 *                         puntos: 155
 *                     - id: 788
 *                       texto: "Estimados ciudadanos, hemos programado la visita técnica"
 *                       usuario_id: 1
 *                       reporte_id: 456
 *                       fecha_creacion: "2024-08-07T09:15:00Z"
 *                       fecha_actualizacion: "2024-08-07T09:15:00Z"
 *                       editado: false
 *                       usuario:
 *                         id: 1
 *                         nombre: "Admin Municipal"
 *                         rol: "admin"
 *                         puntos: 0
 *               sin_comentarios:
 *                 summary: Reporte sin comentarios
 *                 description: Reporte que aún no tiene discusión
 *                 value:
 *                   success: true
 *                   message: "No hay comentarios para este reporte aún"
 *                   total: 0
 *                   pagination:
 *                     page: 1
 *                     limit: 10
 *                     totalPages: 0
 *                   data: []
 *               comentarios_paginados:
 *                 summary: Lista paginada de comentarios
 *                 value:
 *                   success: true
 *                   message: "Página 1 de 3 - 10 comentarios de 25 totales"
 *                   total: 25
 *                   pagination:
 *                     page: 1
 *                     limit: 10
 *                     totalPages: 3
 *                   data: []
 *       404:
 *         description: ❌ Reporte no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               reporte_inexistente:
 *                 summary: ID de reporte no válido
 *                 value:
 *                   success: false
 *                   message: "No se encontró un reporte con ID 999"
 *                   error: "REPORT_NOT_FOUND"
 *       422:
 *         description: ❌ Parámetros de consulta inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               parametros_invalidos:
 *                 summary: Parámetros de paginación incorrectos
 *                 value:
 *                   success: false
 *                   message: "El parámetro 'limit' debe estar entre 5 y 50"
 *                   error: "INVALID_PAGINATION_PARAMS"
 *       500:
 *         description: ❌ Error interno del servidor
 */
router.get('/:reporte_id', comentariosController.getComentariosByReporte);

/**
 * @swagger
 * /api/comentarios/{id}:
 *   patch:
 *     summary: Editar comentario existente
 *     description: |
 *       Permite al autor de un comentario modificar su contenido dentro de un tiempo límite.
 *       
 *       **Funcionalidad:**
 *       - Solo el autor del comentario puede editarlo
 *       - Edición permitida dentro de 24 horas después de creado
 *       - Marca automáticamente el comentario como "editado"
 *       - Registra timestamp de la última modificación
 *       - Aplica las mismas validaciones que crear comentario
 *       - Mantiene historial de cambios para moderación
 *       
 *       **Restricciones de edición:**
 *       - Solo el usuario autor puede editar su comentario
 *       - Administradores pueden editar cualquier comentario (moderación)
 *       - Tiempo límite: 24 horas después de la creación
 *       - Comentarios en reportes cerrados no se pueden editar
 *       - Mismas validaciones de contenido que comentarios nuevos
 *       
 *       **Casos de uso:**
 *       - Corregir errores tipográficos o información incorrecta
 *       - Agregar información adicional olvidada
 *       - Clarificar puntos confusos en el comentario original
 *       - Moderación por parte de administradores
 *       - Actualizar estado o progreso mencionado
 *       
 *       **Indicadores visuales:**
 *       - Comentarios editados muestran etiqueta "Editado"
 *       - Timestamp de última modificación visible
 *       - En frontend, diferente estilo visual para editados
 *     tags: [💬 Comentarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *           minimum: 1
 *         required: true
 *         description: ID único del comentario a editar
 *         example: 789
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ComentarioUpdateRequest'
 *           examples:
 *             correccion_error:
 *               summary: Corrección de información incorrecta
 *               description: Usuario corrigiendo datos erróneos en su comentario
 *               value:
 *                 texto: "Corrijo mi comentario anterior: el problema está en la Calle Morelos esquina con Hidalgo, no en la Calle Reforma como mencioné inicialmente. Disculpen la confusión."
 *             informacion_adicional:
 *               summary: Agregando información olvidada
 *               description: Usuario complementando su comentario original
 *               value:
 *                 texto: "Confirmo este problema en la Calle Hidalgo. ACTUALIZACIÓN: Acabo de hablar con el encargado de obras públicas y me confirmó que ya tienen programada la reparación para la próxima semana."
 *             clarificacion:
 *               summary: Clarificando comentario confuso
 *               value:
 *                 texto: "Para aclarar mi comentario anterior: cuando dije 'toda la cuadra' me refería específicamente a la sección entre las calles Juárez y Morelos, aproximadamente 200 metros lineales."
 *             moderacion_admin:
 *               summary: Edición por moderación administrativa
 *               description: Administrador editando contenido inapropiado
 *               value:
 *                 texto: "Comentario editado por moderación: Se confirma el problema reportado. Por favor mantengamos un lenguaje respetuoso en la discusión."
 *     responses:
 *       200:
 *         description: ✅ Comentario actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ComentarioResponse'
 *             examples:
 *               edicion_exitosa:
 *                 summary: Comentario editado correctamente
 *                 value:
 *                   success: true
 *                   message: "Comentario actualizado correctamente. Los cambios son visibles para todos los usuarios."
 *                   data:
 *                     id: 789
 *                     texto: "Corrijo mi comentario anterior: el problema está en la Calle Morelos esquina con Hidalgo"
 *                     usuario_id: 123
 *                     reporte_id: 456
 *                     fecha_creacion: "2024-08-08T14:30:00Z"
 *                     fecha_actualizacion: "2024-08-08T16:15:00Z"
 *                     editado: true
 *                     usuario:
 *                       id: 123
 *                       nombre: "María González"
 *                       rol: "ciudadano"
 *                       puntos: 155
 *       400:
 *         description: ❌ Error en los datos proporcionados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               tiempo_limite_excedido:
 *                 summary: Tiempo límite para edición expirado
 *                 value:
 *                   success: false
 *                   message: "No puedes editar este comentario porque han pasado más de 24 horas desde su creación"
 *                   error: "EDIT_TIME_LIMIT_EXCEEDED"
 *               contenido_inapropiado:
 *                 summary: Nuevo contenido inapropiado
 *                 value:
 *                   success: false
 *                   message: "El texto actualizado contiene lenguaje inapropiado. Por favor, usa un tono respetuoso"
 *                   error: "INAPPROPRIATE_CONTENT"
 *               texto_muy_corto:
 *                 summary: Texto editado demasiado breve
 *                 value:
 *                   success: false
 *                   message: "El comentario editado debe tener al menos 10 caracteres"
 *                   error: "COMMENT_TOO_SHORT"
 *       401:
 *         description: ❌ Token de autenticación requerido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: ❌ Sin permisos para editar este comentario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               no_es_autor:
 *                 summary: Usuario no es el autor del comentario
 *                 value:
 *                   success: false
 *                   message: "Solo puedes editar tus propios comentarios"
 *                   error: "NOT_COMMENT_AUTHOR"
 *               reporte_cerrado:
 *                 summary: Reporte cerrado para ediciones
 *                 value:
 *                   success: false
 *                   message: "No se pueden editar comentarios en reportes cerrados"
 *                   error: "REPORT_CLOSED_FOR_EDITING"
 *       404:
 *         description: ❌ Comentario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               comentario_inexistente:
 *                 summary: ID de comentario no válido
 *                 value:
 *                   success: false
 *                   message: "No se encontró el comentario con ID 999"
 *                   error: "COMMENT_NOT_FOUND"
 *       422:
 *         description: ❌ Datos de entrada inválidos
 *       500:
 *         description: ❌ Error interno del servidor
 */
router.patch('/:id', auth, comentariosController.updateComentario);

/**
 * @swagger
 * /api/comentarios/{id}:
 *   delete:
 *     summary: Eliminar comentario (eliminación suave)
 *     description: |
 *       Permite eliminar un comentario, ocultándolo de la vista pública pero manteniendo el registro.
 *       
 *       **Funcionalidad:**
 *       - Solo el autor del comentario puede eliminarlo
 *       - Administradores pueden eliminar cualquier comentario (moderación)
 *       - Eliminación suave: se oculta pero se mantiene en base de datos
 *       - Tiempo límite: 24 horas después de creación para usuarios normales
 *       - No hay límite de tiempo para administradores
 *       - Mantiene integridad de la conversación
 *       
 *       **Reglas de eliminación:**
 *       - Autor: puede eliminar dentro de 24 horas
 *       - Administrador: puede eliminar en cualquier momento
 *       - Comentarios eliminados muestran placeholder
 *       - No se puede recuperar una vez eliminado por usuario
 *       - Solo admins pueden restaurar comentarios eliminados
 *       
 *       **Comportamiento del sistema:**
 *       - Comentario se marca como eliminado, no se borra físicamente
 *       - Muestra "[Comentario eliminado]" en la interfaz
 *       - Mantiene estructura de la conversación
 *       - Estadísticas se actualizan automáticamente
 *       - Notificaciones de eliminación para moderación
 *       
 *       **Casos de uso:**
 *       - Usuario eliminando comentario por error o información incorrecta
 *       - Administrador removiendo contenido inapropiado
 *       - Limpieza de comentarios spam o irrelevantes
 *       - Moderación de discusiones acaloradas
 *       - Eliminación de información sensible publicada por error
 *     tags: [💬 Comentarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *           minimum: 1
 *         required: true
 *         description: ID único del comentario a eliminar
 *         example: 789
 *     responses:
 *       200:
 *         description: ✅ Comentario eliminado exitosamente
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
 *                   example: "Comentario eliminado correctamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 789
 *                     eliminado:
 *                       type: boolean
 *                       example: true
 *                     fecha_eliminacion:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-08-08T17:00:00Z"
 *                     eliminado_por:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 123
 *                         nombre:
 *                           type: string
 *                           example: "María González"
 *                         rol:
 *                           type: string
 *                           example: "ciudadano"
 *             examples:
 *               eliminacion_por_autor:
 *                 summary: Usuario eliminando su propio comentario
 *                 value:
 *                   success: true
 *                   message: "Tu comentario ha sido eliminado exitosamente"
 *                   data:
 *                     id: 789
 *                     eliminado: true
 *                     fecha_eliminacion: "2024-08-08T17:00:00Z"
 *                     eliminado_por:
 *                       id: 123
 *                       nombre: "María González"
 *                       rol: "ciudadano"
 *               moderacion_admin:
 *                 summary: Administrador eliminando por moderación
 *                 value:
 *                   success: true
 *                   message: "Comentario eliminado por moderación. El autor ha sido notificado"
 *                   data:
 *                     id: 789
 *                     eliminado: true
 *                     fecha_eliminacion: "2024-08-08T17:00:00Z"
 *                     eliminado_por:
 *                       id: 1
 *                       nombre: "Admin Municipal"
 *                       rol: "admin"
 *       400:
 *         description: ❌ No se puede eliminar el comentario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               tiempo_limite_excedido:
 *                 summary: Tiempo límite para eliminación expirado
 *                 value:
 *                   success: false
 *                   message: "No puedes eliminar este comentario porque han pasado más de 24 horas desde su creación"
 *                   error: "DELETE_TIME_LIMIT_EXCEEDED"
 *               ya_eliminado:
 *                 summary: Comentario ya fue eliminado
 *                 value:
 *                   success: false
 *                   message: "Este comentario ya fue eliminado anteriormente"
 *                   error: "COMMENT_ALREADY_DELETED"
 *       401:
 *         description: ❌ Token de autenticación requerido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: ❌ Sin permisos para eliminar este comentario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               no_es_autor:
 *                 summary: Usuario no es el autor del comentario
 *                 value:
 *                   success: false
 *                   message: "Solo puedes eliminar tus propios comentarios"
 *                   error: "NOT_COMMENT_AUTHOR"
 *               reporte_cerrado:
 *                 summary: Reporte protegido contra eliminaciones
 *                 value:
 *                   success: false
 *                   message: "No se pueden eliminar comentarios en reportes archivados"
 *                   error: "REPORT_PROTECTED"
 *       404:
 *         description: ❌ Comentario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               comentario_inexistente:
 *                 summary: ID de comentario no válido
 *                 value:
 *                   success: false
 *                   message: "No se encontró el comentario con ID 999"
 *                   error: "COMMENT_NOT_FOUND"
 *       500:
 *         description: ❌ Error interno del servidor
 */
router.delete('/:id', auth, comentariosController.deleteComentario);

module.exports = router;