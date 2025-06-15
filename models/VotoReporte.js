const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VotoReporte = sequelize.define('VotoReporte', {
  id: 
  { 
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
 },
  reporte_id:
   { 
    type: DataTypes.INTEGER,
    allowNull: false 
},
  usuario_id: 
  {
    type: DataTypes.INTEGER,
    allowNull: false 
},
  tipo_voto: { type: DataTypes.ENUM('up', 'down'), allowNull: false },
  fecha_voto: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'votos_reportes',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['reporte_id', 'usuario_id']
    }
  ]
});

module.exports = VotoReporte;