const express = require('express');
const router = express.Router();
const categoriasController = require('../controllers/CategoriasController');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

/**
 * @swagger
 * components:
 *   schemas:
 *     Categoria:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la categoría
 *           example: 1
 *         nombre:
 *           type: string
 *           description: Nombre descriptivo de la categoría
 *           example: "Infraestructura"
 *         icono:
 *           type: string
 *           description: Nombre del archivo de icono para la interfaz
 *           example: "infraestructura.svg"
 *         descripcion:
 *           type: string
 *           description: Descripción detallada del tipo de reportes que incluye
 *           example: "Problemas relacionados con calles, banquetas, alumbrado público y servicios básicos"
 *         activa:
 *           type: boolean
 *           description: Indica si la categoría está disponible para crear nuevos reportes
 *           example: true
 *         orden_visualizacion:
 *           type: integer
 *           description: Orden de aparición en las listas (menor número = mayor prioridad)
 *           example: 1
 *         fecha_creacion:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de creación de la categoría
 *           example: "2024-01-15T09:00:00Z"
 *         fecha_actualizacion:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de última modificación
 *           example: "2024-08-08T14:30:00Z"
 *         total_reportes:
 *           type: integer
 *           description: Cantidad total de reportes creados en esta categoría
 *           example: 1247
 *     
 *     CategoriaRequest:
 *       type: object
 *       required:
 *         - nombre
 *         - descripcion
 *       properties:
 *         nombre:
 *           type: string
 *           minLength: 3
 *           maxLength: 50
 *           description: Nombre único de la categoría (3-50 caracteres)
 *           example: "Seguridad Pública"
 *         icono:
 *           type: string
 *           maxLength: 100
 *           description: Nombre del archivo de icono (opcional, formato SVG recomendado)
 *           example: "seguridad-publica.svg"
 *         descripcion:
 *           type: string
 *           minLength: 10
 *           maxLength: 500
 *           description: Descripción clara de qué tipo de problemas incluye esta categoría
 *           example: "Reportes relacionados con delincuencia, iluminación deficiente, espacios públicos inseguros y solicitudes de vigilancia"
 *         activa:
 *           type: boolean
 *           default: true
 *           description: Estado de la categoría - true para disponible, false para oculta
 *           example: true
 *         orden_visualizacion:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           description: Posición en la lista (1=primera posición, 100=última)
 *           example: 3
 *     
 *     CategoriasResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indica si la operación fue exitosa
 *           example: true
 *         message:
 *           type: string
 *           description: Mensaje descriptivo del resultado
 *           example: "Categorías obtenidas correctamente"
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Categoria'
 *         total:
 *           type: integer
 *           description: Número total de categorías activas
 *           example: 9
 *     
 *     CategoriaResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Categoría procesada correctamente"
 *         data:
 *           $ref: '#/components/schemas/Categoria'
 */

/**
 * @swagger
 * /api/categorias:
 *   get:
 *     summary: Obtener todas las categorías disponibles
 *     description: |
 *       Retorna la lista completa de categorías de reportes disponibles en el sistema Voz Urbana.
 *       
 *       **Funcionalidad:**
 *       - Obtiene solo categorías activas (activa = true)
 *       - Ordenadas por orden_visualizacion ascendente
 *       - Incluye estadísticas de uso (total de reportes por categoría)
 *       - No requiere autenticación (endpoint público)
 *       - Optimizado para carga rápida en frontend
 *       
 *       **Datos incluidos:**
 *       - Información básica de cada categoría
 *       - Iconos para interfaz de usuario
 *       - Conteo de reportes por categoría
 *       - Estado de disponibilidad
 *       
 *       **Casos de uso:**
 *       - Cargar opciones en formulario de nuevo reporte
 *       - Mostrar estadísticas en dashboard público
 *       - Filtrar reportes por categoría
 *       - Crear menús de navegación
 *     tags: [🏷️ Categorías ]
 *     responses:
 *       200:
 *         description: ✅ Lista de categorías obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoriasResponse'
 *             examples:
 *               categorias_completas:
 *                 summary: Respuesta completa con todas las categorías
 *                 value:
 *                   success: true
 *                   message: "9 categorías activas encontradas"
 *                   total: 9
 *                   data:
 *                     - id: 1
 *                       nombre: "Infraestructura"
 *                       icono: "infraestructura.svg"
 *                       descripcion: "Problemas con calles, banquetas, puentes y obras públicas"
 *                       activa: true
 *                       orden_visualizacion: 1
 *                       total_reportes: 1247
 *                     - id: 2
 *                       nombre: "Servicios Públicos"
 *                       icono: "servicios.svg"
 *                       descripcion: "Agua, drenaje, recolección de basura y alumbrado público"
 *                       activa: true
 *                       orden_visualizacion: 2
 *                       total_reportes: 892
 *                     - id: 3
 *                       nombre: "Seguridad Pública"
 *                       icono: "seguridad.svg"
 *                       descripcion: "Delincuencia, iluminación deficiente y espacios inseguros"
 *                       activa: true
 *                       orden_visualizacion: 3
 *                       total_reportes: 634
 *               sin_categorias:
 *                 summary: Sistema sin categorías configuradas
 *                 value:
 *                   success: true
 *                   message: "No se encontraron categorías activas"
 *                   total: 0
 *                   data: []
 *       500:
 *         description: ❌ Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               error_bd:
 *                 summary: Error de base de datos
 *                 value:
 *                   success: false
 *                   message: "Error al obtener categorías desde la base de datos"
 *                   error: "DATABASE_CONNECTION_ERROR"
 */
router.get('/', categoriasController.getCategorias);

/**
 * @swagger
 * /api/categorias:
 *   post:
 *     summary: Crear nueva categoría de reportes
 *     description: |
 *       Permite a administradores municipales crear nuevas categorías para clasificar reportes ciudadanos.
 *       
 *       **Funcionalidad:**
 *       - Solo administradores pueden crear categorías
 *       - Valida unicidad del nombre de categoría
 *       - Asigna automáticamente orden de visualización si no se especifica
 *       - Categoría se activa automáticamente al crearla
 *       - Registra fecha de creación automáticamente
 *       
 *       **Validaciones aplicadas:**
 *       - Nombre debe ser único en el sistema
 *       - Descripción mínimo 10 caracteres para claridad
 *       - Orden de visualización entre 1-100
 *       - Formato de icono válido (SVG recomendado)
 *       
 *       **Casos de uso:**
 *       - Agregar nueva categoría para problemas específicos del municipio
 *       - Reorganizar clasificación de reportes
 *       - Personalizar sistema según necesidades locales
 *       - Expandir tipos de reportes disponibles
 *     tags: [🏷️ Categorías]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoriaRequest'
 *           examples:
 *             categoria_medio_ambiente:
 *               summary: Nueva categoría de Medio Ambiente
 *               description: Ejemplo de categoría para temas ambientales
 *               value:
 *                 nombre: "Medio Ambiente"
 *                 icono: "medio-ambiente.svg"
 *                 descripcion: "Reportes sobre contaminación, áreas verdes, manejo de residuos y problemas ambientales del municipio"
 *                 activa: true
 *                 orden_visualizacion: 4
 *             categoria_turismo:
 *               summary: Categoría específica para municipio turístico
 *               description: Ejemplo para municipios con enfoque turístico
 *               value:
 *                 nombre: "Turismo y Comercio"
 *                 icono: "turismo.svg"
 *                 descripcion: "Problemas en zonas turísticas, señalización, comercio ambulante y servicios al visitante"
 *                 activa: true
 *                 orden_visualizacion: 8
 *             categoria_minima:
 *               summary: Categoría con campos mínimos requeridos
 *               value:
 *                 nombre: "Otros"
 *                 descripcion: "Reportes que no encajan en otras categorías específicas"
 *     responses:
 *       201:
 *         description: ✅ Categoría creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoriaResponse'
 *             examples:
 *               categoria_creada:
 *                 summary: Categoría creada correctamente
 *                 value:
 *                   success: true
 *                   message: "Categoría 'Medio Ambiente' creada exitosamente"
 *                   data:
 *                     id: 10
 *                     nombre: "Medio Ambiente"
 *                     icono: "medio-ambiente.svg"
 *                     descripcion: "Reportes sobre contaminación, áreas verdes, manejo de residuos y problemas ambientales"
 *                     activa: true
 *                     orden_visualizacion: 4
 *                     fecha_creacion: "2024-08-08T10:30:00Z"
 *                     fecha_actualizacion: "2024-08-08T10:30:00Z"
 *                     total_reportes: 0
 *       400:
 *         description: ❌ Error en los datos proporcionados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               nombre_duplicado:
 *                 summary: Nombre de categoría ya existe
 *                 value:
 *                   success: false
 *                   message: "Ya existe una categoría con el nombre 'Infraestructura'"
 *                   error: "DUPLICATE_CATEGORY_NAME"
 *               validacion_error:
 *                 summary: Error en validación de campos
 *                 value:
 *                   success: false
 *                   message: "La descripción debe tener al menos 10 caracteres"
 *                   error: "VALIDATION_ERROR"
 *       401:
 *         description: ❌ Token de autenticación requerido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               no_token:
 *                 summary: Sin token de autenticación
 *                 value:
 *                   success: false
 *                   message: "Token de acceso requerido. Inicia sesión para continuar"
 *                   error: "NO_TOKEN_PROVIDED"
 *       403:
 *         description: ❌ Acceso restringido solo para administradores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               acceso_denegado:
 *                 summary: Usuario sin permisos administrativos
 *                 value:
 *                   success: false
 *                   message: "Acceso denegado. Solo administradores pueden crear categorías"
 *                   error: "ADMIN_ACCESS_REQUIRED"
 *       422:
 *         description: ❌ Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: ❌ Error interno del servidor
 */
router.post('/', auth, isAdmin, categoriasController.createCategoria);

/**
 * @swagger
 * /api/categorias/{id}:
 *   patch:
 *     summary: Actualizar información de categoría existente
 *     description: |
 *       Permite a administradores modificar cualquier aspecto de una categoría existente.
 *       
 *       **Funcionalidad:**
 *       - Solo administradores pueden modificar categorías
 *       - Actualización parcial (solo campos enviados se modifican)
 *       - Valida unicidad de nombre si se cambia
 *       - Permite activar/desactivar categorías sin eliminarlas
 *       - Actualiza automáticamente fecha_actualizacion
 *       
 *       **Campos modificables:**
 *       - Nombre (debe seguir siendo único)
 *       - Descripción (mínimo 10 caracteres)
 *       - Icono (archivo de imagen)
 *       - Estado activa/inactiva
 *       - Orden de visualización
 *       
 *       **Consideraciones especiales:**
 *       - Desactivar categoría no afecta reportes existentes
 *       - Cambiar orden afecta visualización en frontend
 *       - Reportes existentes mantienen referencia a categoría
 *       
 *       **Casos de uso:**
 *       - Corregir información de categoría
 *       - Cambiar orden de aparición en listas
 *       - Desactivar temporalmente una categoría
 *       - Actualizar iconos o descripciones
 *     tags: [🏷️ Categorías]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *           minimum: 1
 *         required: true
 *         description: ID único de la categoría a actualizar
 *         example: 5
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *                 description: Nuevo nombre para la categoría (opcional)
 *                 example: "Seguridad y Vigilancia"
 *               icono:
 *                 type: string
 *                 maxLength: 100
 *                 description: Actualizar archivo de icono (opcional)
 *                 example: "seguridad-nueva.svg"
 *               descripcion:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *                 description: Nueva descripción de la categoría (opcional)
 *                 example: "Reportes de seguridad pública, vigilancia, delincuencia y espacios públicos inseguros"
 *               activa:
 *                 type: boolean
 *                 description: Cambiar estado de disponibilidad (opcional)
 *                 example: true
 *               orden_visualizacion:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100
 *                 description: Nueva posición en la lista (opcional)
 *                 example: 2
 *           examples:
 *             actualizacion_completa:
 *               summary: Actualización completa de categoría
 *               value:
 *                 nombre: "Seguridad y Vigilancia"
 *                 icono: "seguridad-actualizada.svg"
 *                 descripcion: "Reportes relacionados con seguridad pública, vigilancia policial, delincuencia y espacios públicos que requieren mayor atención"
 *                 activa: true
 *                 orden_visualizacion: 2
 *             solo_descripcion:
 *               summary: Actualizar solo descripción
 *               value:
 *                 descripcion: "Categoría actualizada para incluir también reportes de violencia doméstica y problemas de convivencia vecinal"
 *             desactivar_categoria:
 *               summary: Desactivar categoría temporalmente
 *               value:
 *                 activa: false
 *             cambiar_orden:
 *               summary: Reordenar posición en lista
 *               value:
 *                 orden_visualizacion: 1
 *     responses:
 *       200:
 *         description: ✅ Categoría actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoriaResponse'
 *             examples:
 *               actualizacion_exitosa:
 *                 summary: Categoría modificada correctamente
 *                 value:
 *                   success: true
 *                   message: "Categoría 'Seguridad y Vigilancia' actualizada correctamente"
 *                   data:
 *                     id: 5
 *                     nombre: "Seguridad y Vigilancia"
 *                     icono: "seguridad-actualizada.svg"
 *                     descripcion: "Reportes relacionados con seguridad pública, vigilancia policial, delincuencia y espacios públicos que requieren mayor atención"
 *                     activa: true
 *                     orden_visualizacion: 2
 *                     fecha_creacion: "2024-01-15T09:00:00Z"
 *                     fecha_actualizacion: "2024-08-08T15:45:00Z"
 *                     total_reportes: 634
 *       400:
 *         description: ❌ Error en los datos proporcionados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               nombre_duplicado:
 *                 summary: Nuevo nombre ya existe
 *                 value:
 *                   success: false
 *                   message: "Ya existe otra categoría con el nombre 'Infraestructura'"
 *                   error: "DUPLICATE_CATEGORY_NAME"
 *       401:
 *         description: ❌ Token de autenticación requerido
 *       403:
 *         description: ❌ Acceso restringido solo para administradores
 *       404:
 *         description: ❌ Categoría no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               categoria_no_existe:
 *                 summary: ID de categoría no válido
 *                 value:
 *                   success: false
 *                   message: "No se encontró la categoría con ID 999"
 *                   error: "CATEGORY_NOT_FOUND"
 *       422:
 *         description: ❌ Datos de entrada inválidos
 *       500:
 *         description: ❌ Error interno del servidor
 */
router.patch('/:id', auth, isAdmin, categoriasController.updateCategoria);

/**
 * @swagger
 * /api/categorias/{id}:
 *   delete:
 *     summary: Desactivar categoría (eliminación suave)
 *     description: |
 *       Desactiva una categoría para evitar su uso en nuevos reportes, sin afectar reportes existentes.
 *       
 *       **Funcionalidad:**
 *       - Solo administradores pueden desactivar categorías
 *       - Eliminación suave: cambia activa=false, no borra registro
 *       - Reportes existentes mantienen referencia a la categoría
 *       - Categoría desaparece de listas para nuevos reportes
 *       - Posibilidad de reactivar posteriormente
 *       
 *       **Comportamiento del sistema:**
 *       - Reportes existentes siguen mostrando la categoría
 *       - No aparece en formularios de nuevo reporte
 *       - Estadísticas históricas se mantienen
 *       - Búsquedas y filtros siguen funcionando
 *       
 *       **Casos de uso:**
 *       - Categoría obsoleta o redundante
 *       - Reorganización del sistema de clasificación
 *       - Eliminación temporal por mantenimiento
 *       - Consolidación de categorías similares
 *       
 *       **Importante:**
 *       - Esta operación NO elimina los reportes asociados
 *       - Los reportes existentes conservan su categoría
 *       - Se puede revertir cambiando activa=true con PATCH
 *     tags: [🏷️ Categorías]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *           minimum: 1
 *         required: true
 *         description: ID único de la categoría a desactivar
 *         example: 8
 *     responses:
 *       200:
 *         description: ✅ Categoría desactivada exitosamente
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
 *                   example: "Categoría desactivada correctamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 8
 *                     nombre:
 *                       type: string
 *                       example: "Categoría Obsoleta"
 *                     activa:
 *                       type: boolean
 *                       example: false
 *                     reportes_afectados:
 *                       type: integer
 *                       description: Número de reportes que mantendrán esta categoría
 *                       example: 45
 *                     fecha_desactivacion:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-08-08T16:00:00Z"
 *             examples:
 *               desactivacion_exitosa:
 *                 summary: Categoría desactivada correctamente
 *                 value:
 *                   success: true
 *                   message: "Categoría 'Eventos Temporales' desactivada. Los 23 reportes existentes mantienen su clasificación"
 *                   data:
 *                     id: 8
 *                     nombre: "Eventos Temporales"
 *                     activa: false
 *                     reportes_afectados: 23
 *                     fecha_desactivacion: "2024-08-08T16:00:00Z"
 *               categoria_sin_reportes:
 *                 summary: Desactivación de categoría sin reportes
 *                 value:
 *                   success: true
 *                   message: "Categoría 'Test' desactivada. No hay reportes asociados"
 *                   data:
 *                     id: 12
 *                     nombre: "Test"
 *                     activa: false
 *                     reportes_afectados: 0
 *                     fecha_desactivacion: "2024-08-08T16:00:00Z"
 *       401:
 *         description: ❌ Token de autenticación requerido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: ❌ Acceso restringido solo para administradores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               sin_permisos:
 *                 summary: Usuario sin permisos administrativos
 *                 value:
 *                   success: false
 *                   message: "Solo administradores pueden desactivar categorías"
 *                   error: "ADMIN_ACCESS_REQUIRED"
 *       404:
 *         description: ❌ Categoría no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               categoria_inexistente:
 *                 summary: ID de categoría no válido
 *                 value:
 *                   success: false
 *                   message: "No se encontró la categoría con ID 999"
 *                   error: "CATEGORY_NOT_FOUND"
 *               ya_desactivada:
 *                 summary: Categoría ya estaba desactivada
 *                 value:
 *                   success: false
 *                   message: "La categoría 'Obsoleta' ya estaba desactivada"
 *                   error: "CATEGORY_ALREADY_INACTIVE"
 *       409:
 *         description: ❌ Conflicto - categoría crítica no se puede desactivar
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               categoria_critica:
 *                 summary: Categoría esencial del sistema
 *                 value:
 *                   success: false
 *                   message: "La categoría 'Infraestructura' es esencial y no se puede desactivar"
 *                   error: "CRITICAL_CATEGORY_PROTECTION"
 *       500:
 *         description: ❌ Error interno del servidor
 */
router.delete('/:id', auth, isAdmin, categoriasController.deleteCategoria);

module.exports = router;