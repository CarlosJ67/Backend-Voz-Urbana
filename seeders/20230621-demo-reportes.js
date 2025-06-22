const estados = ['nuevo', 'en_proceso', 'resuelto', 'cerrado'];
const prioridades = ['baja', 'media', 'alta'];
const titulos = [
  'Fuga de agua', 'Bache en la calle', 'Alumbrado público apagado', 'Basura acumulada', 'Árbol caído',
  'Ruido excesivo', 'Falta de señalización', 'Animal peligroso', 'Contenedor desbordado', 'Grafiti en pared'
];
const descripciones = [
  'Se detectó el problema hace varios días.',
  'Vecinos han reportado esta situación varias veces.',
  'Solicitamos pronta atención.',
  'El problema afecta la seguridad de la zona.',
  'Es urgente resolverlo para evitar accidentes.'
];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max, decimals = 6) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const TOTAL_REPORTES = 1000;

    // Obtén los IDs reales de usuarios y categorías
    const usuarios = await queryInterface.sequelize.query(
      'SELECT id FROM usuarios',
      { type: Sequelize.QueryTypes.SELECT }
    );
    const categorias = await queryInterface.sequelize.query(
      'SELECT id FROM categorias',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const usuarioIds = usuarios.map(u => u.id);
    const categoriaIds = categorias.map(c => c.id);

    const reportes = [];
    for (let i = 0; i < TOTAL_REPORTES; i++) {
      const categoria_id = categoriaIds[getRandomInt(0, categoriaIds.length - 1)];
      const usuario_id = usuarioIds[getRandomInt(0, usuarioIds.length - 1)];
      const titulo = titulos[getRandomInt(0, titulos.length - 1)];
      const descripcion = descripciones[getRandomInt(0, descripciones.length - 1)];
      const estado = estados[getRandomInt(0, estados.length - 1)];
      const prioridad = prioridades[getRandomInt(0, prioridades.length - 1)];
      const latitud = getRandomFloat(19.20, 19.60); // CDMX aprox
      const longitud = getRandomFloat(-99.30, -99.00);
      const fecha_creacion = new Date(Date.now() - getRandomInt(0, 60) * 24 * 60 * 60 * 1000); // últimos 2 meses
      const fecha_actualizacion = new Date(fecha_creacion.getTime() + getRandomInt(0, 10) * 24 * 60 * 60 * 1000);

      reportes.push({
        titulo,
        descripcion,
        categoria_id,
        ubicacion: `Colonia ${getRandomInt(1, 50)}, Calle ${getRandomInt(1, 100)}`,
        latitud,
        longitud,
        estado,
        prioridad,
        imagen_url: null,
        usuario_id,
        asignado_a: null,
        fecha_creacion,
        fecha_actualizacion
      });
    }

    await queryInterface.bulkInsert('reportes', reportes, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('reportes', null, {});
  }
};