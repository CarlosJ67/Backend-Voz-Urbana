const { Report, User } = require('../models');
const Sequelize = require('sequelize');
const reportsController = {
  async createReport(req, res) {
    try {
      const { title, description, category, latitude, longitude } = req.body;
      const userId = req.user.id;

      const report = await Report.create({
        title,
        description,
        category,
        latitude,
        longitude,
        userId
      });

      // Añade puntos al usuario por crear un reporte
      await User.increment('points', { by: 10, where: { id: userId } });

      res.status(201).json({
        message: 'Reporte creado exitosamente',
        report
      });
    } catch (error) {
      res.status(500).json({ message: 'Error al crear reporte', error: error.message });
    }
  },

  async getAllReports(req, res) {
    try {
      const reports = await Report.findAll({
        include: [{
          model: User,
          attributes: ['id', 'name']
        }],
        order: [['createdAt', 'DESC']]
      });
      
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener reportes', error: error.message });
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
            [Sequelize.Op.between]: [lat - radius, lat + radius]
          },
          longitude: {
            [Sequelize.Op.between]: [lng - radius, lng + radius]
          }
        }
      });
      
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener reportes por ubicación', error: error.message });
    }
  }
};

module.exports = reportsController;