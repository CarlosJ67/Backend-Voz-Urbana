const { Report, User } = require("../models");
const Sequelize = require("sequelize");

const reportsController = {
  async createReport(req, res) {
    try {
      const {
        titulo,
        descripcion,
        categoria_id,
        latitud,
        longitud,
        ubicacion,
        prioridad,
      } = req.body;
      const usuario_id = req.user.id;

      // Manejar imagen subida
      let imagen_path = null;
      if (req.file) {
        // Guardar la ruta relativa de la imagen
        imagen_path = `/uploads/reports/${req.file.filename}`;
      }

     const report = await Report.create({
        titulo,
        descripcion,
        categoria_id: parseInt(categoria_id),
        latitud: parseFloat(latitud),
        longitud: parseFloat(longitud),
        ubicacion,
        imagen_path, 
        usuario_id,
        prioridad,
      });

      // Añade puntos al usuario por crear un reporte
      await User.increment("puntos", { by: 10, where: { id: usuario_id } });

      // Obtener el reporte con información del usuario para la notificación
      const reportWithUser = await Report.findByPk(report.id, {
        include: [{
          model: User,
          attributes: ['id', 'nombre', 'email']
        }]
      });

      // Enviar notificación WebSocket sobre el nuevo reporte
      if (req.app && req.app.locals.notificationWS) {
        req.app.locals.notificationWS.notifyNewReport(reportWithUser);
      }

      // Construir URL absoluta para la imagen si existe
      let imagen_url = null;
      if (reportWithUser.imagen_path) {
        const protocol = req.protocol;
        const host = req.get('host');
        imagen_url = `${protocol}://${host}${reportWithUser.imagen_path}`;
      }

      // Formatear fechas en ISO
      const fecha_creacion = reportWithUser.fecha_creacion ? new Date(reportWithUser.fecha_creacion).toISOString() : null;
      const fecha_actualizacion = reportWithUser.fecha_actualizacion ? new Date(reportWithUser.fecha_actualizacion).toISOString() : null;

      // Responder con objeto enriquecido
      res.status(201).json({
        message: "Reporte creado exitosamente",
        report: {
          ...reportWithUser.toJSON(),
          imagen_url,
          fecha_creacion,
          fecha_actualizacion
        }
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al crear reporte", error: error.message });
    }
  },

  async getAllReports(req, res) {
    try {
      // Construir filtros dinámicos basados en query parameters
      const whereCondition = {};
      
      // Filtrar por estado si se proporciona
      if (req.query.estado) {
        const estadosValidos = ['nuevo', 'en_proceso', 'resuelto', 'cerrado', 'no_aprobado'];
        if (estadosValidos.includes(req.query.estado)) {
          whereCondition.estado = req.query.estado;
        }
      }

      // Filtrar por categoria_id si se proporciona
      if (req.query.categoria_id) {
        whereCondition.categoria_id = req.query.categoria_id;
      }

      // Filtrar por usuario_id si se proporciona
      if (req.query.usuario_id) {
        whereCondition.usuario_id = req.query.usuario_id;
      }

      const reports = await Report.findAll({
        where: whereCondition,
        include: [
          {
            model: User,
            attributes: ["id", "nombre", "email"],
          },
        ],
        order: [["fecha_creacion", "DESC"]],
      });

      res.json(reports);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al obtener reportes", error: error.message });
    }
  },

  async getReportById(req, res) {
    try {
      const { id } = req.params;

      const report = await Report.findByPk(id, {
        include: [
          {
            model: User,
            attributes: ["id", "nombre", "email"],
          },
        ],
      });

      if (!report) {
        return res.status(404).json({ message: "Reporte no encontrado" });
      }

      res.json(report);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al obtener el reporte", error: error.message });
    }
  },

  async getReportsByLocation(req, res) {
    try {
      const { lat, lng, radius } = req.params;
      // Me falta Implementar lógica para filtrar por ubicación
      // Ejemplo: buscar reportes dentro de un radio específico
      const reports = await Report.findAll({
        where: {
          latitude: {
            [Sequelize.Op.between]: [lat - radius, lat + radius],
          },
          longitude: {
            [Sequelize.Op.between]: [lng - radius, lng + radius],
          },
        },
      });

      res.json(reports);
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Error al obtener reportes por ubicación",
          error: error.message,
        });
    }
  },

  async getReportsByUser(req, res) {
    try {
      const { userId } = req.params;

      const reports = await Report.findAll({
        where: {
          usuario_id: userId,
        },
        include: [
          {
            model: User,
            attributes: ["id", "nombre", "email"],
          },
        ],
        order: [["fecha_creacion", "DESC"]],
      });

      res.json({
        message: `Reportes del usuario ${userId}`,
        count: reports.length,
        reports,
      });
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Error al obtener reportes del usuario",
          error: error.message,
        });
    }
  },

  async updateReport(req, res) {
    try {
      const { id } = req.params;
      const usuario_id = req.user.id;

      const report = await Report.findByPk(id);
      if (!report) {
        return res.status(404).json({ message: "Reporte no encontrado" });
      }

      // Opcional: Validar si el usuario que creó el reporte es quien lo edita
      if (report.usuario_id !== usuario_id) {
        return res
          .status(403)
          .json({ message: "No autorizado para editar este reporte" });
      }

      const camposActualizables = [
        "titulo",
        "descripcion",
        "categoria_id",
        "latitud",
        "longitud",
        "ubicacion",
        "imagen_path",
        "prioridad",
        "estado",
      ];

      camposActualizables.forEach((campo) => {
        if (req.body[campo] !== undefined) {
          report[campo] = req.body[campo];
        }
      });

      await report.save();

      res.json({ message: "Reporte actualizado correctamente", report });
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Error al actualizar el reporte",
          error: error.message,
        });
    }
  },

  async deleteReport(req, res) {
    try {
      const { id } = req.params;
      const usuario_id = req.user.id;

      const report = await Report.findByPk(id);
      if (!report) {
        return res.status(404).json({ message: "Reporte no encontrado" });
      }

      // Solo el admin o el creador del reporte pueden eliminarlo
      if (req.user.rol !== "admin" && report.usuario_id !== req.user.id) {
        return res
          .status(403)
          .json({ message: "No autorizado para eliminar este reporte" });
      }

      await report.destroy();

      res.json({ message: "Reporte eliminado correctamente" });
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Error al eliminar el reporte",
          error: error.message,
        });
    }
  },

  async updateReportStatusAdmin(req, res) {
    try {
      const { id } = req.params;
      const { estado, asignado_a } = req.body;

      // Verificar que el usuario sea admin
      if (req.user.rol !== 'admin') {
        return res.status(403).json({ message: 'Acceso denegado. Solo los administradores pueden actualizar estados de reportes.' });
      }

      const report = await Report.findByPk(id);
      if (!report) {
        return res.status(404).json({ message: 'Reporte no encontrado' });
      }

      // Validar que el estado sea válido
      const estadosValidos = ['nuevo', 'en_proceso', 'resuelto', 'cerrado', 'no_aprobado'];
      if (estado && !estadosValidos.includes(estado)) {
        return res.status(400).json({ message: 'Estado no válido. Debe ser: nuevo, en_proceso, resuelto, cerrado o no_aprobado' });
      }

      const oldStatus = report.estado;

      // Actualizar solo los campos permitidos para admin
      if (estado !== undefined) {
        report.estado = estado;
      }

      await report.save();

      // Retornar el reporte actualizado con información del usuario
      const updatedReport = await Report.findByPk(id, {
        include: [{
          model: User,
          attributes: ['id', 'nombre', 'email']
        }]
      });

      // Enviar notificación WebSocket sobre el cambio de estado
      if (req.app && req.app.locals.notificationWS && estado && oldStatus !== estado) {
        req.app.locals.notificationWS.notifyStatusChange(updatedReport, oldStatus, estado);
      }

      res.json({
        message: 'Estado del reporte actualizado exitosamente',
        report: updatedReport
      });
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar estado del reporte', error: error.message });
    }
  }
};

module.exports = reportsController;