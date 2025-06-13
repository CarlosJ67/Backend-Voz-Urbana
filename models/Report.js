const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Report = sequelize.define('Report', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('saneamiento','salud publica', 'medio_ambiente', 'infraestructura', 'seguridad', 'otros'),
    allowNull: false
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pendiente', 'en_progreso', 'resuelto', 'rechazado'),
    defaultValue: 'pendiente'
  },
  evidenceUrl: {
    type: DataTypes.STRING
  }
}, {
  timestamps: true
});

module.exports = Report;