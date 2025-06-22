const bcrypt = require('bcryptjs');


const nombresHombres = [
  'Carlos', 'Juan', 'Pedro', 'Luis', 'Miguel', 'Jorge', 'Andrés', 'Fernando', 'Ricardo', 'Manuel',
  'Alejandro', 'Sergio', 'Eduardo', 'Roberto', 'Francisco', 'Raúl', 'Héctor', 'Adrián', 'Iván', 'Óscar',
  'Diego', 'Antonio', 'Javier', 'Rubén', 'Daniel', 'David', 'José', 'Ángel', 'Pablo', 'Víctor', 'Alberto',
  'Raul', 'Enrique', 'Arturo', 'Felipe', 'Jesús', 'Alfonso', 'Guillermo', 'Emilio', 'Marcos', 'Julio',
  'Salvador', 'Manuel', 'Agustín', 'Rafael', 'Santiago', 'Vicente', 'Alfredo', 'Ramón', 'Gerardo'
];

const nombresMujeres = [
  'María', 'Ana', 'Laura', 'Patricia', 'Sandra', 'Gabriela', 'Paola', 'Verónica', 'Carmen', 'Diana',
  'Alejandra', 'Claudia', 'Jessica', 'Mónica', 'Daniela', 'Lucía', 'Fernanda', 'Andrea', 'Sofía', 'Valeria',
  'Isabel', 'Beatriz', 'Rosa', 'Teresa', 'Silvia', 'Elena', 'Julia', 'Raquel', 'Marina', 'Adriana', 'Natalia',
  'Victoria', 'Carolina', 'Alicia', 'Irma', 'Leticia', 'Rocío', 'Olivia', 'Luisa', 'Esther', 'Ángela',
  'Pilar', 'Concepción', 'Consuelo', 'Mercedes', 'Josefina', 'Guadalupe', 'Margarita', 'Rebeca', 'Camila'
];

const apellidos = [
  'García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Martín',
  'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno', 'Álvarez', 'Muñoz', 'Romero', 'Alonso', 'Gutiérrez',
  'Navarro', 'Torres', 'Domínguez', 'Vázquez', 'Ramos', 'Gil', 'Ramírez', 'Serrano', 'Blanco', 'Suárez',
  'Molina', 'Morales', 'Ortega', 'Delgado', 'Castro', 'Ortiz', 'Rubio', 'Marín', 'Sanz', 'Iglesias',
  'Medina', 'Garrido', 'Cortés', 'Castillo', 'Santos', 'Lozano', 'Guerrero', 'Cano', 'Prieto', 'Méndez',
  'Cruz', 'Calvo', 'Gallego', 'Vidal', 'León', 'Herrera', 'Márquez', 'Peña', 'Flores', 'Cabrera', 'Reyes',
  'Acosta', 'Aguilar', 'Bravo', 'Campos', 'Cervantes', 'Contreras', 'Corona', 'Fuentes', 'Juárez', 'Mendoza',
  'Mejía', 'Miranda', 'Montes', 'Núñez', 'Ochoa', 'Pacheco', 'Padilla', 'Palacios', 'Quintero', 'Rangel',
  'Robles', 'Rosales', 'Solís', 'Tapia', 'Valdez', 'Vega', 'Zamora', 'Zúñiga'
];

function getRandomName() {
  const esMujer = Math.random() < 0.5;
  const nombre = esMujer 
    ? nombresMujeres[Math.floor(Math.random() * nombresMujeres.length)]
    : nombresHombres[Math.floor(Math.random() * nombresHombres.length)];
  
  let apellido1 = apellidos[Math.floor(Math.random() * apellidos.length)];
  let apellido2 = apellidos[Math.floor(Math.random() * apellidos.length)];
  
  // Asegurar apellidos diferentes
  while(apellido1 === apellido2) {
    apellido2 = apellidos[Math.floor(Math.random() * apellidos.length)];
  }
  
  return `${nombre} ${apellido1} ${apellido2}`;
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const BATCH_SIZE = 500; // Insertar en lotes para mejor rendimiento
    const TOTAL_USERS = 1000;
    const password_hash = await bcrypt.hash('123456', 10);
    
    // Generar administradores (4)
    const admins = [
      {
        nombre: 'Carlos García López',
        email: 'admin1@demo.com',
        password_hash,
        rol: 'admin',
        puntos: 100,
        activo: true,
        fecha_registro: new Date(),
        fecha_actualizacion: new Date()
      },
      {
        nombre: 'Ana Martínez Sánchez',
        email: 'admin2@demo.com',
        password_hash,
        rol: 'admin',
        puntos: 95,
        activo: true,
        fecha_registro: new Date(),
        fecha_actualizacion: new Date()
      },
      {
        nombre: 'Juan Rodríguez Pérez',
        email: 'admin3@demo.com',
        password_hash,
        rol: 'admin',
        puntos: 90,
        activo: true,
        fecha_registro: new Date(),
        fecha_actualizacion: new Date()
      },
      {
        nombre: 'María Fernández Gómez',
        email: 'admin4@demo.com',
        password_hash,
        rol: 'admin',
        puntos: 85,
        activo: true,
        fecha_registro: new Date(),
        fecha_actualizacion: new Date()
      }
    ];

    // Insertar administradores primero
    await queryInterface.bulkInsert('usuarios', admins, {});
    
    // Generar ciudadanos en lotes
    for (let batch = 0; batch < TOTAL_USERS - 4; batch += BATCH_SIZE) {
      const currentBatchSize = Math.min(BATCH_SIZE, TOTAL_USERS - 4 - batch);
      const ciudadanos = [];
      
      for (let i = 0; i < currentBatchSize; i++) {
        const userId = 5 + batch + i;
        ciudadanos.push({
          nombre: getRandomName(),
          email: `usuario${userId}@demo.com`,
          password_hash,
          rol: 'ciudadano',
          puntos: Math.floor(Math.random() * 100),
          activo: true,
          fecha_registro: new Date(),
          fecha_actualizacion: new Date()
        });
      }
      
      await queryInterface.bulkInsert('usuarios', ciudadanos, {});
      console.log(`Insertado lote de ${currentBatchSize} usuarios (total: ${batch + currentBatchSize + 4}/${TOTAL_USERS})`);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('usuarios', null, {});
  }
};