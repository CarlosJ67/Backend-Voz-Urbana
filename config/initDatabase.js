const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const { User, Categoria } = require("../models");

// Configuración de la conexión sin especificar la base de datos
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
};

const initDatabase = async () => {
  let connection;

  try {
    // Crear conexión sin especificar base de datos
    connection = await mysql.createConnection(dbConfig);

    // Crear la base de datos si no existe
    await connection.execute(
      `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log(`✅ Base de datos '${process.env.DB_NAME}' verificada/creada`);

    await connection.end();

    // Ahora conectar con Sequelize para crear tablas
    const db = require("./database");

    await db.authenticate();
    console.log("✅ Conexión con Sequelize establecida");

    // Sincronizar modelos (crear tablas)
    await db.sync({ alter: true });
    console.log("✅ Tablas sincronizadas");

    // Insertar datos iniciales
    await insertInitialData();
  } catch (error) {
    console.error("❌ Error durante la inicialización:", error);
    throw error;
  }
};

const insertInitialData = async () => {
  try {
    // Verificar si ya existen categorías
    const categoriasCount = await Categoria.count();

    if (categoriasCount === 0) {
      console.log("📋 Insertando categorías iniciales...");

      const categorias = [
        {
          id: 1,
          nombre: "Infraestructura",
          icono: "Construction",
          descripcion:
            "Problemas con calles, banquetas, puentes y construcción urbana",
          activa: true,
          orden_visualizacion: 1,
        },
        {
          id: 2,
          nombre: "Servicios Públicos",
          icono: "Zap",
          descripcion: "Alumbrado público, electricidad y servicios básicos",
          activa: true,
          orden_visualizacion: 2,
        },
        {
          id: 3,
          nombre: "Saneamiento",
          icono: "Droplets",
          descripcion:
            "Problemas de agua, drenaje y sistemas de alcantarillado",
          activa: true,
          orden_visualizacion: 3,
        },
        {
          id: 4,
          nombre: "Limpieza",
          icono: "Trash2",
          descripcion:
            "Basura, limpieza urbana y mantenimiento de áreas públicas",
          activa: true,
          orden_visualizacion: 4,
        },
        {
          id: 5,
          nombre: "Seguridad",
          icono: "Shield",
          descripcion: "Seguridad pública, robos, vandalismo y delincuencia",
          activa: true,
          orden_visualizacion: 5,
        },
        {
          id: 6,
          nombre: "Transporte",
          icono: "Bus",
          descripcion: "Transporte público, semáforos y señalización vial",
          activa: true,
          orden_visualizacion: 6,
        },
        {
          id: 7,
          nombre: "Medio Ambiente",
          icono: "Leaf",
          descripcion:
            "Contaminación, ruido, áreas verdes y problemas ambientales",
          activa: true,
          orden_visualizacion: 7,
        },
        {
          id: 8,
          nombre: "Salud Pública",
          icono: "Heart",
          descripcion: "Problemas de salud comunitaria y servicios de salud",
          activa: true,
          orden_visualizacion: 8,
        },
        {
          id: 9,
          nombre: "Otros",
          icono: "AlertCircle",
          descripcion:
            "Otros problemas urbanos no clasificados en las categorías anteriores",
          activa: true,
          orden_visualizacion: 9,
        },
      ];

      await Categoria.bulkCreate(categorias);
      console.log("✅ Categorías iniciales insertadas");
    } else {
      console.log("ℹ️ Las categorías ya existen, omitiendo inserción");
    }

    // Verificar si ya existe el usuario admin
    const adminUser = await User.findOne({
      where: { email: "admin@vozUrbana.com" },
    });

    if (!adminUser) {
      console.log("👤 Creando usuario administrador...");

      const hashedPassword = await bcrypt.hash("12345678", 10);

      await User.create({
        id: 1,
        nombre: "admin",
        email: "admin@vozUrbana.com",
        password_hash: hashedPassword,
        rol: "admin",
        puntos: 0,
        activo: true,
      });

      console.log("✅ Usuario administrador creado");
    } else {
      console.log("ℹ️ El usuario administrador ya existe, omitiendo creación");
    }
  } catch (error) {
    console.error("❌ Error al insertar datos iniciales:", error);
    throw error;
  }
};

module.exports = initDatabase;
