const textos = [
  'Totalmente de acuerdo.',
  'Esto debe resolverse pronto.',
  'Gracias por reportar.',
  'Yo también lo he notado.',
  '¿Ya hay respuesta de las autoridades?',
  '¡Urgente solución!',
  'Afecta a toda la colonia.',
  'Excelente reporte.',
  '¿Alguien más tiene este problema?',
  'Esperemos que lo arreglen rápido.'
];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const TOTAL_COMENTARIOS = 1000;

    
    const reportes = await queryInterface.sequelize.query(
      'SELECT id FROM reportes',
      { type: Sequelize.QueryTypes.SELECT }
    );
    const usuarios = await queryInterface.sequelize.query(
      'SELECT id FROM usuarios',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const reporteIds = reportes.map(r => r.id);
    const usuarioIds = usuarios.map(u => u.id);

    const comentarios = [];
    for (let i = 0; i < TOTAL_COMENTARIOS; i++) {
      const reporte_id = reporteIds[getRandomInt(0, reporteIds.length - 1)];
      const usuario_id = usuarioIds[getRandomInt(0, usuarioIds.length - 1)];
      const texto = textos[getRandomInt(0, textos.length - 1)];
      const fecha_comentario = new Date(Date.now() - getRandomInt(0, 60) * 24 * 60 * 60 * 1000); // últimos 2 meses

      comentarios.push({
        reporte_id,
        usuario_id,
        texto,
        fecha_comentario,
        activo: true
      });
    }

    await queryInterface.bulkInsert('comentarios', comentarios, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('comentarios', null, {});
  }
};