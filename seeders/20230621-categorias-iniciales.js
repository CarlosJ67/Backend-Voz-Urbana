module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('categorias', [
      {
        nombre: 'Saneamiento',
        icono: 'saneamiento.png',
        descripcion: 'Problemas relacionados con limpieza, drenaje y basura.',
        activa: true,
        orden_visualizacion: 1
      },
      {
        nombre: 'Infraestructura',
        icono: 'infraestructura.png',
        descripcion: 'Calles, alumbrado, baches, puentes y obras públicas.',
        activa: true,
        orden_visualizacion: 2
      },
      {
        nombre: 'Salud Pública',
        icono: 'salud.png',
        descripcion: 'Reportes de salud pública y prevención.',
        activa: true,
        orden_visualizacion: 3
      },
      {
        nombre: 'Seguridad',
        icono: 'seguridad.png',
        descripcion: 'Situaciones de riesgo, delitos y protección civil.',
        activa: true,
        orden_visualizacion: 4
      },
      {
        nombre: 'Medio Ambiente',
        icono: 'medioambiente.png',
        descripcion: 'Áreas verdes, contaminación, animales y recursos naturales.',
        activa: true,
        orden_visualizacion: 5
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('categorias', null, {});
  }
};