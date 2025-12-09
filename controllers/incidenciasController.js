// controllers/incidenciasController.js
const { Incidencia, User } = require('../models');
const { Op } = require('sequelize');

const incidenciasController = {
  // Obtener todas las incidencias con filtros
  async getIncidencias(req, res) {
    try {
      const { 
        tipo, 
        modulo, 
        resuelto, 
        fecha_desde, 
        fecha_hasta,
        limit = 50,
        offset = 0 
      } = req.query;

      const whereCondition = {};

      if (tipo) whereCondition.tipo = tipo;
      if (modulo) whereCondition.modulo = modulo;
      if (resuelto !== undefined) whereCondition.resuelto = resuelto === 'true';

      if (fecha_desde || fecha_hasta) {
        whereCondition.fecha_creacion = {};
        if (fecha_desde) whereCondition.fecha_creacion[Op.gte] = new Date(fecha_desde);
        if (fecha_hasta) whereCondition.fecha_creacion[Op.lte] = new Date(fecha_hasta);
      }

      const incidencias = await Incidencia.findAndCountAll({
        where: whereCondition,
        include: [{
          model: User,
          attributes: ['id', 'nombre', 'email'],
          required: false
        }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['fecha_creacion', 'DESC']]
      });

      res.json({
        incidencias: incidencias.rows,
        total: incidencias.count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error al obtener incidencias', 
        error: error.message 
      });
    }
  },

  // Obtener estadísticas de incidencias
  async getEstadisticas(req, res) {
    try {
      const { fecha_desde, fecha_hasta } = req.query;
      
      const whereCondition = {};
      if (fecha_desde || fecha_hasta) {
        whereCondition.fecha_creacion = {};
        if (fecha_desde) whereCondition.fecha_creacion[Op.gte] = new Date(fecha_desde);
        if (fecha_hasta) whereCondition.fecha_creacion[Op.lte] = new Date(fecha_hasta);
      }

      const [
        totalIncidencias,
        incidenciasCriticas,
        incidenciasResueltas,
        incidenciasPorTipo,
        incidenciasPorModulo
      ] = await Promise.all([
        Incidencia.count({ where: whereCondition }),
        Incidencia.count({ where: { ...whereCondition, tipo: 'critical' } }),
        Incidencia.count({ where: { ...whereCondition, resuelto: true } }),
        Incidencia.findAll({
          attributes: [
            'tipo',
            [sequelize.fn('COUNT', sequelize.col('tipo')), 'count']
          ],
          where: whereCondition,
          group: ['tipo']
        }),
        Incidencia.findAll({
          attributes: [
            'modulo',
            [sequelize.fn('COUNT', sequelize.col('modulo')), 'count']
          ],
          where: whereCondition,
          group: ['modulo']
        })
      ]);

      res.json({
        resumen: {
          total: totalIncidencias,
          criticas: incidenciasCriticas,
          resueltas: incidenciasResueltas,
          pendientes: totalIncidencias - incidenciasResueltas,
          porcentajeResolucion: totalIncidencias > 0 ? 
            Math.round((incidenciasResueltas / totalIncidencias) * 100) : 0
        },
        distribucion: {
          porTipo: incidenciasPorTipo,
          porModulo: incidenciasPorModulo
        }
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error al obtener estadísticas', 
        error: error.message 
      });
    }
  },

  // Marcar incidencia como resuelta
  async resolverIncidencia(req, res) {
    try {
      const { id } = req.params;
      const { notas_resolucion } = req.body;

      const incidencia = await Incidencia.findByPk(id);
      if (!incidencia) {
        return res.status(404).json({ message: 'Incidencia no encontrada' });
      }

      incidencia.resuelto = true;
      incidencia.fecha_resolucion = new Date();
      if (notas_resolucion) {
        incidencia.datos_adicionales = {
          ...incidencia.datos_adicionales,
          notas_resolucion
        };
      }

      await incidencia.save();

      res.json({ 
        message: 'Incidencia marcada como resuelta',
        incidencia 
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error al resolver incidencia', 
        error: error.message 
      });
    }
  }
};

module.exports = incidenciasController;