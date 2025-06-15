const User = require('./User');
const Report = require('./Report');
const Categoria = require('./Categoria'); 

// Un usuario tiene muchos reportes
User.hasMany(Report, { foreignKey: 'usuario_id' });
Report.belongsTo(User, { foreignKey: 'usuario_id' });

// Una categoría tiene muchos reportes
Categoria.hasMany(Report, { foreignKey: 'categoria_id' });
Report.belongsTo(Categoria, { foreignKey: 'categoria_id' });

module.exports = {
  User,
  Report,
  Categoria 
};