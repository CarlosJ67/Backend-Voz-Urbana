const bcrypt = require('bcryptjs');
const { User } = require('../models');

const nombresHombres = [ 'Carlos', 'Juan', 'Pedro', 'Luis', 'Miguel', 'Jorge', 'Andrés', 'Fernando', 'Ricardo', 'Manuel',
  'Alejandro', 'Sergio', 'Eduardo', 'Roberto', 'Francisco', 'Raúl', 'Héctor', 'Adrián', 'Iván', 'Óscar',
  'Diego', 'Antonio', 'Javier', 'Rubén', 'Daniel', 'David', 'José', 'Ángel', 'Pablo', 'Víctor', 'Alberto',
  'Raul', 'Enrique', 'Arturo', 'Felipe', 'Jesús', 'Alfonso', 'Guillermo', 'Emilio', 'Marcos', 'Julio',
  'Salvador', 'Manuel', 'Agustín', 'Rafael', 'Santiago', 'Vicente', 'Alfredo', 'Ramón', 'Gerardo'];
const nombresMujeres = ['María', 'Ana', 'Laura', 'Patricia', 'Sandra', 'Gabriela', 'Paola', 'Verónica', 'Carmen', 'Diana',
  'Alejandra', 'Claudia', 'Jessica', 'Mónica', 'Daniela', 'Lucía', 'Fernanda', 'Andrea', 'Sofía', 'Valeria',
  'Isabel', 'Beatriz', 'Rosa', 'Teresa', 'Silvia', 'Elena', 'Julia', 'Raquel', 'Marina', 'Adriana', 'Natalia',
  'Victoria', 'Carolina', 'Alicia', 'Irma', 'Leticia', 'Rocío', 'Olivia', 'Luisa', 'Esther', 'Ángela',
  'Pilar', 'Concepción', 'Consuelo', 'Mercedes', 'Josefina', 'Guadalupe', 'Margarita', 'Rebeca', 'Camila'];
const apellidos = ['García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Martín',
  'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno', 'Álvarez', 'Muñoz', 'Romero', 'Alonso', 'Gutiérrez',
  'Navarro', 'Torres', 'Domínguez', 'Vázquez', 'Ramos', 'Gil', 'Ramírez', 'Serrano', 'Blanco', 'Suárez',
  'Molina', 'Morales', 'Ortega', 'Delgado', 'Castro', 'Ortiz', 'Rubio', 'Marín', 'Sanz', 'Iglesias',
  'Medina', 'Garrido', 'Cortés', 'Castillo', 'Santos', 'Lozano', 'Guerrero', 'Cano', 'Prieto', 'Méndez',
  'Cruz', 'Calvo', 'Gallego', 'Vidal', 'León', 'Herrera', 'Márquez', 'Peña', 'Flores', 'Cabrera', 'Reyes',
  'Acosta', 'Aguilar', 'Bravo', 'Campos', 'Cervantes', 'Contreras', 'Corona', 'Fuentes', 'Juárez', 'Mendoza',
  'Mejía', 'Miranda', 'Montes', 'Núñez', 'Ochoa', 'Pacheco', 'Padilla', 'Palacios', 'Quintero', 'Rangel',
  'Robles', 'Rosales', 'Solís', 'Tapia', 'Valdez', 'Vega', 'Zamora', 'Zúñiga'];

function getRandomName() {
  const esMujer = Math.random() < 0.5;
  const nombre = esMujer
    ? nombresMujeres[Math.floor(Math.random() * nombresMujeres.length)]
    : nombresHombres[Math.floor(Math.random() * nombresHombres.length)];
  let apellido1 = apellidos[Math.floor(Math.random() * apellidos.length)];
  let apellido2 = apellidos[Math.floor(Math.random() * apellidos.length)];
  while (apellido1 === apellido2) {
    apellido2 = apellidos[Math.floor(Math.random() * apellidos.length)];
  }
  return `${nombre} ${apellido1} ${apellido2}`;
}

function getRandomDateInPastYears(years = 5) {
  const now = new Date();
  const past = new Date();
  past.setFullYear(now.getFullYear() - years);
  // Genera un timestamp aleatorio entre 'past' y 'now - 1 día'
  const max = now.getTime() - 24 * 60 * 60 * 1000;
  const min = past.getTime();
  return new Date(Math.floor(Math.random() * (max - min)) + min);
}

function getRandomDateAfter(date, years = 0) {
  const now = new Date();
  const min = date.getTime();
  const max = now.getTime() - 24 * 60 * 60 * 1000;
  if (min >= max) return new Date(min); // Si la fecha de registro es la más reciente posible
  return new Date(Math.floor(Math.random() * (max - min)) + min);
}

exports.generarUsuariosLote = async (req, res) => {
  try {
    const { totalAdmins = 2, totalCiudadanos = 1998, offset = 0 } = req.body || {};
    const password_hash = await bcrypt.hash('123456', 10);

    if (totalAdmins + totalCiudadanos > 2000) {
      return res.status(400).json({ message: 'Máximo 2000 usuarios por petición.' });
    }

    const timestamp = Date.now();

    const admins = [];
    for (let i = 0; i < totalAdmins; i++) {
      const fecha_registro = getRandomDateInPastYears();
      const fecha_actualizacion = getRandomDateAfter(fecha_registro);
      admins.push({
        nombre: getRandomName(),
        email: `admin${timestamp}_${offset + i}@demo.com`,
        password_hash,
        rol: 'admin',
        puntos: 100,
        activo: true,
        fecha_registro,
        fecha_actualizacion
      });
    }

    const ciudadanos = [];
    for (let i = 0; i < totalCiudadanos; i++) {
      const fecha_registro = getRandomDateInPastYears();
      const fecha_actualizacion = getRandomDateAfter(fecha_registro);
      ciudadanos.push({
        nombre: getRandomName(),
        email: `usuario${timestamp}_${offset + i}@demo.com`,
        password_hash,
        rol: 'ciudadano',
        puntos: Math.floor(Math.random() * 100),
        activo: true,
        fecha_registro,
        fecha_actualizacion
      });
    }

    await User.bulkCreate([...admins, ...ciudadanos]);
    res.json({ message: `Usuarios generados: ${admins.length} admins, ${ciudadanos.length} ciudadanos` });
  } catch (error) {
    res.status(500).json({ message: 'Error al generar usuarios', error: error.message });
  }
};