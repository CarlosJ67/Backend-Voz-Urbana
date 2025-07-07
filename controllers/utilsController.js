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

exports.generarUsuariosLote = async (req, res) => {
  try {
    const { totalAdmins = 2, totalCiudadanos = 10000, offset = 0 } = req.body || {};
    const password_hash = await bcrypt.hash('123456', 10);

    // Limita la cantidad máxima por lote para evitar saturar el servidor
    if (totalAdmins > 1000 || totalCiudadanos > 100000) {
      return res.status(400).json({ message: 'Demasiados usuarios solicitados. Usa valores menores.' });
    }

    const timestamp = Date.now(); // Para emails únicos por lote

    const admins = [];
    for (let i = 0; i < totalAdmins; i++) {
      admins.push({
        nombre: getRandomName(),
        email: `admin${timestamp}_${offset + i}@demo.com`,
        password_hash,
        rol: 'admin',
        puntos: 100,
        activo: true,
        fecha_registro: new Date(),
        fecha_actualizacion: new Date()
      });
    }

    const ciudadanos = [];
    for (let i = 0; i < totalCiudadanos; i++) {
      ciudadanos.push({
        nombre: getRandomName(),
        email: `usuario${timestamp}_${offset + i}@demo.com`,
        password_hash,
        rol: 'ciudadano',
        puntos: Math.floor(Math.random() * 100),
        activo: true,
        fecha_registro: new Date(),
        fecha_actualizacion: new Date()
      });
    }

    await User.bulkCreate([...admins, ...ciudadanos]);
    res.json({ message: `Usuarios generados: ${admins.length} admins, ${ciudadanos.length} ciudadanos` });
  } catch (error) {
    res.status(500).json({ message: 'Error al generar usuarios', error: error.message });
  }
};