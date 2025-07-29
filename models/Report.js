const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Report = sequelize.define('Report', {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  titulo: 
  { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  descripcion: 
  {
     type: DataTypes.TEXT, 
    allowNull: false 
  },
  categoria_id: 
  { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  }, 
  ubicacion: 
  { 
    type: DataTypes.STRING
   },
  latitud: 
  { 
    type: DataTypes.FLOAT,
     allowNull: false 
    },
  longitud: 
  { 
    type: DataTypes.FLOAT, 
    allowNull: false 
  },
  estado: 
  { 
    type: DataTypes.ENUM('nuevo', 'en_proceso', 'resuelto', 'cerrado', 'no_aprobado'), 
    defaultValue: 'nuevo' 
  },
  prioridad: { type: DataTypes.ENUM('baja', 'media', 'alta'), defaultValue: 'media' },
  imagen_url: { type: DataTypes.STRING },
  usuario_id: { type: DataTypes.INTEGER, allowNull: false }, 
  asignado_a: { type: DataTypes.INTEGER },
}, {
  tableName: 'reportes',
  timestamps: true, 
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_actualizacion'
});

module.exports = Report;