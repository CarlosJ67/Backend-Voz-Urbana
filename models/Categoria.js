const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Categoria = sequelize.define('Categoria', {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
},
  nombre: { 
    type: DataTypes.STRING,
     allowNull: false 
    },
  icono: { 
    type: DataTypes.STRING 
},
  descripcion: { 
    type: DataTypes.TEXT 
},
  activa: { 
    type: DataTypes.BOOLEAN,
     defaultValue: true 
    },
  orden_visualizacion: { 
    type: DataTypes.INTEGER,
     defaultValue: 0 
    }
}, {
  tableName: 'categorias',
  timestamps: false
});

module.exports = Categoria;