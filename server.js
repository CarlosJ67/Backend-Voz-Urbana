require("dotenv").config();
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const cors = require("cors");
const app = express();
const authRoutes = require("./routes/auth");
const reportRoutes = require("./routes/reports");
const categoriasRoutes = require("./routes/categorias");
const comentariosRoutes = require("./routes/comentarios");
const votosRoutes = require("./routes/votos");
const utilsRoutes = require("./routes/utils");

// Middlewares
app.use(cors());
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/categorias", categoriasRoutes);
app.use("/api/comentarios", comentariosRoutes);
app.use("/api/votos", votosRoutes);
app.use("/api/utils", utilsRoutes);

const db = require("./config/database");
const initDatabase = require("./config/initDatabase");

// Inicialización automática de la base de datos
initDatabase()
  .then(() => {
    console.log("🚀 Inicialización de base de datos completada");
  })
  .catch((err) => {
    console.error("💥 Error en la inicialización:", err);
    process.exit(1);
  });

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ message: "API de Voz Urbana funcionando" });
});

// Configuración del puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
