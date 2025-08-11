const express = require("express");
const router = express.Router();
const reportsController = require("../controllers/reportsController");
const authMiddleware = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");
const {upload, optimizeImage} = require("../middleware/upload");

/**
 * @swagger
 * components:
 *   schemas:
 *     Reporte:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del reporte
 *           example: 1
 *         titulo:
 *           type: string
 *           description: Título descriptivo del problema
 *           example: "Bache peligroso en avenida principal"
 *         descripcion:
 *           type: string
 *           description: Descripción detallada del problema
 *           example: "Bache de aproximadamente 1 metro de diámetro y 30 cm de profundidad"
 *         categoria_id:
 *           type: integer
 *           description: ID de la categoría del problema
 *           example: 2
 *         ubicacion:
 *           type: string
 *           description: Dirección o referencia de ubicación
 *           example: "Avenida Central entre calles 5 y 6"
 *         latitud:
 *           type: number
 *           format: double
 *           example: 19.432608
 *         longitud:
 *           type: number
 *           format: double
 *           example: -99.133209
 *         imagen_url:
 *           type: string
 *           description: URL de la imagen del problema
 *           example: "https://ejemplo.com/imagenes/bache.jpg"
 *         estado:
 *           type: string
 *           enum: [nuevo, en_proceso, resuelto, cerrado, no_aprobado]
 *           example: "nuevo"
 *         prioridad:
 *           type: string
 *           enum: [baja, media, alta]
 *           example: "alta"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-08-08T14:30:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-08-08T14:30:00Z"
 *         usuario_id:
 *           type: integer
 *           description: ID del usuario que creó el reporte
 *           example: 123
 * 
 *     ReporteDetallado:
 *       allOf:
 *         - $ref: '#/components/schemas/Reporte'
 *         - type: object
 *           properties:
 *             Usuario:
 *               type: object
 *               description: Información del creador del reporte
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 123
 *                 nombre:
 *                   type: string
 *                   example: "Juan Pérez"
 *                 email:
 *                   type: string
 *                   example: "juan@ejemplo.com"
 *             Categoria:
 *               type: object
 *               description: Información de la categoría
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 2
 *                 nombre:
 *                   type: string
 *                   example: "Baches"
 *                 icono:
 *                   type: string
 *                   example: "road"
 * 
 *     NuevoReporte:
 *       type: object
 *       required:
 *         - titulo
 *         - descripcion
 *         - categoria_id
 *         - ubicacion
 *         - latitud
 *         - longitud
 *       properties:
 *         titulo:
 *           type: string
 *           minLength: 10
 *           maxLength: 100
 *           example: "Bache peligroso en avenida principal"
 *         descripcion:
 *           type: string
 *           minLength: 20
 *           maxLength: 1000
 *           example: "Bache de aproximadamente 1 metro de diámetro que ya causó daños a varios vehículos"
 *         categoria_id:
 *           type: integer
 *           minimum: 1
 *           example: 2
 *         ubicacion:
 *           type: string
 *           minLength: 5
 *           example: "Avenida Central entre calles 5 y 6"
 *         latitud:
 *           type: number
 *           format: double
 *           example: 19.432608
 *         longitud:
 *           type: number
 *           format: double
 *           example: -99.133209
 *         prioridad:
 *           type: string
 *           enum: [baja, media, alta]
 *           example: "alta"
 * 
 *     ActualizarReporte:
 *       type: object
 *       properties:
 *         titulo:
 *           type: string
 *           minLength: 10
 *           maxLength: 100
 *           example: "Bache peligroso en avenida principal - URGENTE"
 *         descripcion:
 *           type: string
 *           minLength: 20
 *           maxLength: 1000
 *           example: "El bache ha crecido después de las lluvias recientes"
 *         categoria_id:
 *           type: integer
 *           minimum: 1
 *           example: 2
 *         ubicacion:
 *           type: string
 *           minLength: 5
 *           example: "Avenida Central entre calles 5 y 6, frente al parque"
 *         latitud:
 *           type: number
 *           format: double
 *           example: 19.432608
 *         longitud:
 *           type: number
 *           format: double
 *           example: -99.133209
 *         estado:
 *           type: string
 *           enum: [nuevo, en_proceso, resuelto, cerrado, no_aprobado]
 *           example: "en_proceso"
 *         prioridad:
 *           type: string
 *           enum: [baja, media, alta]
 *           example: "alta"
 * 
 *     RespuestaReportes:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         total:
 *           type: integer
 *           example: 25
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
 *               example: 3
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Reporte'
 * 
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   name: 🚨 Reportes
 */

/**
 * @swagger
 * /api/reports:
 *   post:
 *     summary: Crear un nuevo reporte ciudadano
 *     description: |
 *       Permite a los usuarios registrados reportar problemas en la vía pública, infraestructura dañada
 *       u otras incidencias que requieran atención municipal.
 *       
 *       **Funcionalidad:**
 *       - Registra problemas urbanos con ubicación precisa
 *       - Permite adjuntar fotos como evidencia
 *       - Clasifica reportes por categoría y prioridad
 *       - Notifica a las autoridades competentes
 *       - Genera historial de participación ciudadana
 *       
 *       **Validaciones:**
 *       - Usuario debe estar autenticado
 *       - Campos obligatorios completos
 *       - Ubicación geográfica válida
 *       - Tamaño y formato de imagen adecuados
 *       
 *       **Procesamiento:**
 *       - Optimización automática de imágenes
 *       - Geocodificación inversa para validar ubicación
 *       - Análisis inicial de prioridad
 *       - Notificación a usuarios cercanos
 *     tags: [🚨 Reportes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/NuevoReporte'
 *           examples:
 *             bache:
 *               summary: Reporte de bache peligroso
 *               value:
 *                 titulo: "Bache enorme en avenida principal"
 *                 descripcion: "Bache de más de 1 metro de diámetro que está causando accidentes"
 *                 categoria_id: 2
 *                 ubicacion: "Av. Principal km 5.5"
 *                 latitud: 19.432608
 *                 longitud: -99.133209
 *                 prioridad: "alta"
 *                 imagen: "(binary)"
 *             alumbrado:
 *               summary: Poste de luz dañado
 *               value:
 *                 titulo: "Poste de luz roto en parque central"
 *                 descripcion: "El poste de luz #45 está inclinado y puede caerse"
 *                 categoria_id: 3
 *                 ubicacion: "Parque Central, cerca de la fuente"
 *                 latitud: 19.433000
 *                 longitud: -99.134000
 *                 prioridad: "media"
 *     responses:
 *       201:
 *         description: ✅ Reporte creado exitosamente
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
 *                   example: "Reporte creado correctamente. Número de seguimiento #12345"
 *                 data:
 *                   $ref: '#/components/schemas/Reporte'
 *             examples:
 *               respuesta_exitosa:
 *                 value:
 *                   success: true
 *                   message: "Reporte creado correctamente. Número de seguimiento #12345"
 *                   data:
 *                     id: 12345
 *                     titulo: "Bache enorme en avenida principal"
 *                     descripcion: "Bache de más de 1 metro de diámetro que está causando accidentes"
 *                     categoria_id: 2
 *                     ubicacion: "Av. Principal km 5.5"
 *                     latitud: 19.432608
 *                     longitud: -99.133209
 *                     estado: "nuevo"
 *                     prioridad: "alta"
 *                     imagen_url: "https://ejemplo.com/imagenes/bache.jpg"
 *                     usuario_id: 123
 *                     createdAt: "2024-08-08T14:30:00Z"
 *       400:
 *         description: ❌ Error en los datos del reporte
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error de validación en los datos del reporte"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                         example: "latitud"
 *                       message:
 *                         type: string
 *                         example: "La latitud debe ser un número válido"
 *             examples:
 *               validacion_fallida:
 *                 value:
 *                   success: false
 *                   message: "Error de validación en los datos del reporte"
 *                   errors:
 *                     - field: "latitud"
 *                       message: "La latitud debe ser un número válido"
 *                     - field: "descripcion"
 *                       message: "La descripción debe tener al menos 20 caracteres"
 *       401:
 *         description: ❌ No autorizado (token inválido o no proporcionado)
 *       500:
 *         description: ❌ Error interno del servidor
 */
router.post("/", 
  authMiddleware, 
  upload.single('imagen'), 
  optimizeImage,
  reportsController.createReport
);

/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: Obtener todos los reportes (paginados)
 *     description: |
 *       Retorna una lista paginada de todos los reportes disponibles, con opciones de filtrado.
 *       
 *       **Funcionalidad:**
 *       - Paginación automática
 *       - Filtrado por categoría, estado y prioridad
 *       - Ordenamiento por fecha, prioridad o cercanía
 *       - Búsqueda por texto en título y descripción
 *       
 *       **Parámetros de consulta:**
 *       - page: Número de página (default 1)
 *       - limit: Items por página (default 10, max 50)
 *       - categoria: Filtrar por ID de categoría
 *       - estado: Filtrar por estado (nuevo, en_proceso, resuelto, cerrado, no_aprobado)
 *       - prioridad: Filtrar por prioridad (baja, media, alta)
 *       - search: Búsqueda textual
 *       - sort: Orden (nuevos, antiguos, prioridad)
 *     tags: [🚨 Reportes]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Items por página
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de categoría
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [nuevo, en_proceso, resuelto, cerrado, no_aprobado]
 *         description: Filtrar por estado
 *       - in: query
 *         name: prioridad
 *         schema:
 *           type: string
 *           enum: [baja, media, alta]
 *         description: Filtrar por prioridad
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda textual en título y descripción
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [nuevos, antiguos, prioridad]
 *           default: "nuevos"
 *         description: Criterio de ordenamiento
 *     responses:
 *       200:
 *         description: ✅ Lista de reportes obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespuestaReportes'
 *             examples:
 *               reportes_paginados:
 *                 value:
 *                   success: true
 *                   total: 25
 *                   pagination:
 *                     page: 1
 *                     limit: 10
 *                     totalPages: 3
 *                   data:
 *                     - id: 12345
 *                       titulo: "Bache enorme en avenida principal"
 *                       descripcion: "Bache de más de 1 metro de diámetro..."
 *                       categoria_id: 2
 *                       estado: "nuevo"
 *                       prioridad: "alta"
 *                       createdAt: "2024-08-08T14:30:00Z"
 *                     - id: 12344
 *                       titulo: "Poste de luz roto"
 *                       descripcion: "Poste inclinado en parque central..."
 *                       categoria_id: 3
 *                       estado: "en_proceso"
 *                       prioridad: "media"
 *                       createdAt: "2024-08-07T09:15:00Z"
 *       500:
 *         description: ❌ Error interno del servidor
 */
router.get("/", reportsController.getAllReports);

/**
 * @swagger
 * /api/reports/{id}:
 *   get:
 *     summary: Obtener detalles de un reporte específico
 *     description: |
 *       Retorna toda la información de un reporte incluyendo datos del usuario que lo creó
 *       y la categoría a la que pertenece.
 *     tags: [🚨 Reportes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del reporte
 *     responses:
 *       200:
 *         description: ✅ Detalles del reporte obtenidos correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReporteDetallado'
 *             examples:
 *               reporte_detallado:
 *                 value:
 *                   id: 12345
 *                   titulo: "Bache enorme en avenida principal"
 *                   descripcion: "Bache de más de 1 metro de diámetro..."
 *                   categoria_id: 2
 *                   ubicacion: "Av. Principal km 5.5"
 *                   latitud: 19.432608
 *                   longitud: -99.133209
 *                   estado: "nuevo"
 *                   prioridad: "alta"
 *                   imagen_url: "https://ejemplo.com/imagenes/bache.jpg"
 *                   createdAt: "2024-08-08T14:30:00Z"
 *                   updatedAt: "2024-08-08T14:30:00Z"
 *                   Usuario:
 *                     id: 123
 *                     nombre: "Juan Pérez"
 *                     email: "juan@ejemplo.com"
 *                   Categoria:
 *                     id: 2
 *                     nombre: "Baches"
 *                     icono: "road"
 *       404:
 *         description: ❌ Reporte no encontrado
 *       500:
 *         description: ❌ Error interno del servidor
 */
router.get("/:id", reportsController.getReportById);

/**
 * @swagger
 * /api/reports/user/{userId}:
 *   get:
 *     summary: Obtener reportes de un usuario específico
 *     description: |
 *       Retorna todos los reportes creados por un usuario en particular,
 *       con opción de filtrar por estado.
 *     tags: [🚨 Reportes]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del usuario
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [nuevo, en_proceso, resuelto, cerrado, no_aprobado]
 *         description: Filtrar por estado
 *     responses:
 *       200:
 *         description: ✅ Lista de reportes del usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespuestaReportes'
 *       404:
 *         description: ❌ Usuario no encontrado
 *       500:
 *         description: ❌ Error interno del servidor
 */
router.get("/user/:userId", reportsController.getReportsByUser);

/**
 * @swagger
 * /api/reports/location/{lat}/{lng}/{radius}:
 *   get:
 *     summary: Buscar reportes por ubicación geográfica
 *     description: |
 *       Retorna reportes dentro de un radio específico (en km) desde unas coordenadas dadas,
 *       ordenados por cercanía.
 *     tags: [🚨 Reportes]
 *     parameters:
 *       - in: path
 *         name: lat
 *         schema:
 *           type: number
 *           format: double
 *         required: true
 *         description: Latitud del punto central
 *       - in: path
 *         name: lng
 *         schema:
 *           type: number
 *           format: double
 *         required: true
 *         description: Longitud del punto central
 *       - in: path
 *         name: radius
 *         schema:
 *           type: number
 *           format: double
 *         required: true
 *         description: Radio de búsqueda en kilómetros
 *     responses:
 *       200:
 *         description: ✅ Lista de reportes cercanos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespuestaReportes'
 *       400:
 *         description: ❌ Coordenadas inválidas
 *       500:
 *         description: ❌ Error interno del servidor
 */
router.get("/location/:lat/:lng/:radius", reportsController.getReportsByLocation);

/**
 * @swagger
 * /api/reports/admin/status/{id}:
 *   patch:
 *     summary: Actualizar estado de reporte (Solo Admin)
 *     description: |
 *       Permite a los administradores cambiar el estado de un reporte.
 *       
 *       **Funcionalidad:**
 *       - Cambiar estado (nuevo, en_proceso, resuelto, cerrado, no_aprobado)
 *       - Notificar al creador del reporte
 *     tags: [🚨 Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del reporte a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [nuevo, en_proceso, resuelto, cerrado, no_aprobado]
 *                 example: en_proceso
 *     responses:
 *       200:
 *         description: ✅ Estado del reporte actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reporte'
 *       400:
 *         description: ❌ Estado no válido
 *       403:
 *         description: ❌ No autorizado (no es admin)
 *       404:
 *         description: ❌ Reporte no encontrado
 *       500:
 *         description: ❌ Error interno del servidor
 */
router.patch("/admin/status/:id", authMiddleware, isAdmin, reportsController.updateReportStatusAdmin);

/**
 * @swagger
 * /api/reports/{id}:
 *   patch:
 *     summary: Actualizar información del reporte
 *     description: |
 *       Permite al autor del reporte actualizar información básica como título, descripción y ubicación.
 *       
 *       **Funcionalidad:**
 *       - Solo el autor del reporte puede editarlo
 *       - Actualización parcial (solo campos enviados se modifican)
 *       - Tiempo límite: 24 horas después de creación para usuarios
 *       - Mantiene historial de cambios para auditoría
 *       
 *       **Campos editables:**
 *       - Título y descripción del problema
 *       - Ubicación y coordenadas GPS
 *       - Categoría (si se clasificó incorrectamente)
 *       - Prioridad
 *       - Imagen del reporte
 *       
 *       **Restricciones:**
 *       - ❌ NO se puede cambiar el estado (usar endpoint admin específico)
 *       - ❌ NO se puede cambiar el autor del reporte
 *       - ❌ Reportes en estado "cerrado" no son editables
 *       - ✅ Validaciones iguales a crear reporte
 *     tags: [🚨 Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID del reporte a actualizar
 *         example: 456
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 100
 *                 example: "Bache peligroso en Calle Hidalgo - URGENTE"
 *               descripcion:
 *                 type: string
 *                 minLength: 20
 *                 maxLength: 1000
 *                 example: "ACTUALIZACIÓN: El bache se ha expandido significativamente..."
 *               categoria_id:
 *                 type: integer
 *                 minimum: 1
 *                 example: 3
 *               ubicacion:
 *                 type: string
 *                 minLength: 5
 *                 example: "Calle Hidalgo #456, exactamente frente al número 456"
 *               latitud:
 *                 type: number
 *                 format: double
 *                 example: 20.2628
 *               longitud:
 *                 type: number
 *                 format: double
 *                 example: -97.9582
 *               prioridad:
 *                 type: string
 *                 enum: [baja, media, alta]
 *                 example: "alta"
 *               imagen:
 *                 type: string
 *                 format: binary
 *                 description: Nueva imagen del reporte (opcional)
 *     responses:
 *       200:
 *         description: ✅ Reporte actualizado correctamente
 *       400:
 *         description: ❌ Error en los datos proporcionados
 *       403:
 *         description: ❌ No autorizado - Solo el autor puede editar
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No puedes cambiar el estado del reporte. Solo los administradores pueden hacerlo."
 *                 error:
 *                   type: string
 *                   example: "UNAUTHORIZED_STATUS_CHANGE"
 *       404:
 *         description: ❌ Reporte no encontrado
 *       500:
 *         description: ❌ Error interno del servidor
 */
router.patch("/:id", authMiddleware, upload.single('imagen'), optimizeImage, reportsController.updateReport);

/**
 * @swagger
 * /api/reports/{id}:
 *   delete:
 *     summary: Eliminar un reporte
 *     description: |
 *       Permite al creador del reporte o a un administrador eliminarlo.
 *       
 *       **Notas:**
 *       - Eliminación suave (marca como eliminado pero conserva datos)
 *       - Creador solo puede eliminar reportes nuevos
 *       - Admins pueden eliminar cualquier reporte
 *     tags: [🚨 Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del reporte a eliminar
 *     responses:
 *       200:
 *         description: ✅ Reporte eliminado correctamente
 *       403:
 *         description: ❌ No autorizado
 *       404:
 *         description: ❌ Reporte no encontrado
 *       500:
 *         description: ❌ Error interno del servidor
 */
router.delete("/:id", authMiddleware, reportsController.deleteReport);

module.exports = router;