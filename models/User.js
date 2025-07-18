const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: { 
    type: DataTypes.INTEGER,
     primaryKey: true,
      autoIncrement: true
     },
  nombre: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  email: { type: DataTypes.STRING, 
    allowNull: false, 
    unique: true 
  },
  password_hash: { 
    type: DataTypes.STRING,
     allowNull: false 
    },
  rol: { 
    type: DataTypes.ENUM('ciudadano', 'admin'), 
    defaultValue: 'ciudadano' 
  },
  puntos: { 
    type: DataTypes.INTEGER, 
    defaultValue: 0 
  },
  activo: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: true 
  }
}, {
  tableName: 'usuarios',
  timestamps: true,
  createdAt: 'fecha_registro',
  updatedAt: 'fecha_actualizacion'
});

module.exports = User;