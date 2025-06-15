const User = require('./User');
const Report = require('./Report');
const Categoria = require('./Categoria');
const Comentario = require('./Comentario');
const VotoReporte = require('./VotoReporte');

// Un usuario tiene muchos reportes
User.hasMany(Report, { foreignKey: 'usuario_id' });
Report.belongsTo(User, { foreignKey: 'usuario_id' });

// Una categoría tiene muchos reportes
Categoria.hasMany(Report, { foreignKey: 'categoria_id' });
Report.belongsTo(Categoria, { foreignKey: 'categoria_id' });

// Un reporte tiene muchos comentarios
Report.hasMany(Comentario, { foreignKey: 'reporte_id' });
Comentario.belongsTo(Report, { foreignKey: 'reporte_id' });

// Un usuario tiene muchos comentarios
User.hasMany(Comentario, { foreignKey: 'usuario_id' });
Comentario.belongsTo(User, { foreignKey: 'usuario_id' });

// Un reporte tiene muchos votos
Report.hasMany(VotoReporte, { foreignKey: 'reporte_id' });
VotoReporte.belongsTo(Report, { foreignKey: 'reporte_id' });

// Un usuario tiene muchos votos
User.hasMany(VotoReporte, { foreignKey: 'usuario_id' });
VotoReporte.belongsTo(User, { foreignKey: 'usuario_id' });

module.exports = {
  User,
  Report,
  Categoria,
  Comentario,
  VotoReporte
};