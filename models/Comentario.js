const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Comentario = sequelize.define('Comentario', {
  id: 
  { type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
},
  reporte_id: 
  { type: DataTypes.INTEGER,
     allowNull: false 
},
  usuario_id:
   { type: DataTypes.INTEGER, 
    allowNull: false 
},
  texto: 
  { 
    type: DataTypes.TEXT, 
    allowNull: false 
},
  fecha_comentario: 
  { type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW 
},
  activo: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'comentarios',
  timestamps: false
});

module.exports = Comentario;