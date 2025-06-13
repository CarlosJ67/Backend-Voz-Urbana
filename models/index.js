const User = require('./User');
const Report = require('./Report');

// Relación: Un usuario tiene muchos reportes
User.hasMany(Report, { foreignKey: 'userId' });
Report.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  User,
  Report
};