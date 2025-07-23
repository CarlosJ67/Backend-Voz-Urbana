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
        imagen_url,
        prioridad,
      } = req.body;
      const usuario_id = req.user.id;

      const report = await Report.create({
        titulo,
        descripcion,
        categoria_id,
        latitud,
        longitud,
        ubicacion,
        imagen_url,
        usuario_id,
        prioridad,
      });

      // Añade puntos al usuario por crear un reporte
      await User.increment("puntos", { by: 10, where: { id: usuario_id } });

      res.status(201).json({
        message: "Reporte creado exitosamente",
        report,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al crear reporte", error: error.message });
    }
  },

  async getAllReports(req, res) {
    try {
      const reports = await Report.findAll({
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
        "imagen_url",
        "prioridad",
        "estado",
        "asignado_a",
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
};

module.exports = reportsController;
