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
    type: DataTypes.STRING, 
    allowNull: false 
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
    allowNull: false,
    defaultValue: 'nuevo',
  },
  prioridad: { 
    type: DataTypes.ENUM('baja', 'media', 'alta'),
    allowNull: false,
    defaultValue: 'media' 
  },
  imagen_path: { 
    type: DataTypes.STRING 
  },
  usuario_id: { 
    type: DataTypes.INTEGER,
     allowNull: false 
    }
}, {
  tableName: 'reportes',
  timestamps: true, 
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_actualizacion'
});

module.exports = Report;