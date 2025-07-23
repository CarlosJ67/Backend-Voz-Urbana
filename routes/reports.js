const express = require("express");
const router = express.Router();
const reportsController = require("../controllers/reportsController");
const authMiddleware = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Reportes
 *   description: Gestión de reportes ciudadanos
 */

/**
 * @swagger
 * /api/reports:
 *   post:
 *     summary: Crear un nuevo reporte
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *                 example: Bache peligroso en la avenida
 *               descripcion:
 *                 type: string
 *                 example: Hay un bache grande que puede causar accidentes.
 *               categoria_id:
 *                 type: integer
 *                 example: 2
 *               ubicacion:
 *                 type: string
 *                 example: Avenida Central esquina con Calle 5
 *               latitud:
 *                 type: number
 *                 example: 19.432608
 *               longitud:
 *                 type: number
 *                 example: -99.133209
 *               imagen_url:
 *                 type: string
 *                 example: https://ejemplo.com/imagen-bache.jpg
 *               prioridad:
 *                 type: string
 *                 enum: [baja, media, alta]
 *                 example: alta
 *     responses:
 *       201:
 *         description: Reporte creado exitosamente
 *       401:
 *         description: Token no proporcionado o inválido
 */
router.post("/", authMiddleware, reportsController.createReport);

/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: Obtener todos los reportes
 *     tags: [Reportes]
 *     responses:
 *       200:
 *         description: Lista de reportes
 */
router.get("/", reportsController.getAllReports);

/**
 * @swagger
 * /api/reports/{id}:
 *   get:
 *     summary: Obtener un reporte por ID
 *     tags: [Reportes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del reporte
 *     responses:
 *       200:
 *         description: Detalles del reporte
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 titulo:
 *                   type: string
 *                 descripcion:
 *                   type: string
 *                 categoria_id:
 *                   type: integer
 *                 ubicacion:
 *                   type: string
 *                 latitud:
 *                   type: number
 *                 longitud:
 *                   type: number
 *                 estado:
 *                   type: string
 *                 prioridad:
 *                   type: string
 *                 User:
 *                   type: object
 *       404:
 *         description: Reporte no encontrado
 */
router.get("/:id", reportsController.getReportById);

/**
 * @swagger
 * /api/reports/user/{userId}:
 *   get:
 *     summary: Obtener todos los reportes de un usuario específico
 *     tags: [Reportes]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Lista de reportes del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Reportes del usuario 1"
 *                 count:
 *                   type: integer
 *                   example: 5
 *                 reports:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Error al obtener reportes del usuario
 */
router.get("/user/:userId", reportsController.getReportsByUser);

/**
 * @swagger
 * /api/reports/location/{lat}/{lng}/{radius}:
 *   get:
 *     summary: Obtener reportes por ubicación aproximada
 *     tags: [Reportes]
 *     parameters:
 *       - in: path
 *         name: lat
 *         schema:
 *           type: number
 *         required: true
 *         description: Latitud central
 *       - in: path
 *         name: lng
 *         schema:
 *           type: number
 *         required: true
 *         description: Longitud central
 *       - in: path
 *         name: radius
 *         schema:
 *           type: number
 *         required: true
 *         description: Radio de búsqueda (grados)
 *     responses:
 *       200:
 *         description: Lista de reportes cercanos
 */
router.get(
  "/location/:lat/:lng/:radius",
  reportsController.getReportsByLocation
);

/**
 * @swagger
 * /api/reports/{id}:
 *   patch:
 *     summary: Actualizar parcialmente un reporte
 *     tags: [Reportes]
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
 *               titulo:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               categoria_id:
 *                 type: integer
 *               ubicacion:
 *                 type: string
 *               latitud:
 *                 type: number
 *               longitud:
 *                 type: number
 *               imagen_url:
 *                 type: string
 *               prioridad:
 *                 type: string
 *                 enum: [baja, media, alta]
 *               estado:
 *                 type: string
 *                 enum: [nuevo, en_proceso, resuelto, cerrado]
 *               asignado_a:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Reporte actualizado correctamente
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Reporte no encontrado
 */
router.patch("/:id", authMiddleware, reportsController.updateReport);

/**
 * @swagger
 * /api/reports/{id}:
 *   delete:
 *     summary: Eliminar un reporte
 *     tags: [Reportes]
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
 *         description: Reporte eliminado correctamente
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Reporte no encontrado
 */
router.delete("/:id", authMiddleware, reportsController.deleteReport);

module.exports = router;
