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
    type: DataTypes.STRING,
    allowNull: false  
},
  descripcion: { 
    type: DataTypes.TEXT, 
    allowNull: false 
},
  activa: { 
    type: DataTypes.BOOLEAN, 
    allowNull: false,
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