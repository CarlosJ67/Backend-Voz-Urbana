require("dotenv").config();
const express = require("express");
const http = require("http");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const cors = require("cors");
const NotificationWebSocket = require("./websocket");

const app = express();
const server = http.createServer(app);

const authRoutes = require("./routes/auth");
const reportRoutes = require("./routes/reports");
const categoriasRoutes = require("./routes/categorias");
const comentariosRoutes = require("./routes/comentarios");
const votosRoutes = require("./routes/votos");
const utilsRoutes = require("./routes/utils");

// Middlewares
app.use(cors());
app.use(express.json());

// Inicializar WebSocket
const notificationWS = new NotificationWebSocket(server);

// Hacer el WebSocket disponible globalmente para otros módulos
app.locals.notificationWS = notificationWS;

// Importar y configurar rutas de prueba
const { router: testRoutes, setNotificationWS } = require('./routes/test');
setNotificationWS(notificationWS);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/categorias", categoriasRoutes);
app.use("/api/comentarios", comentariosRoutes);
app.use("/api/votos", votosRoutes);
app.use("/api/utils", utilsRoutes);
app.use("/api/test", testRoutes);

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

// Endpoint para obtener estadísticas de WebSocket
app.get("/api/ws/stats", (req, res) => {
  const stats = notificationWS.getStats();
  res.json(stats);
});

// Endpoint para enviar notificación manual (para pruebas)
app.post("/api/ws/test-notification", (req, res) => {
  const { message, type } = req.body;
  notificationWS.broadcast({
    type: type || 'test',
    data: { message: message || 'Notificación de prueba' },
    timestamp: new Date().toISOString()
  });
  res.json({ success: true, message: 'Notificación enviada' });
});

// Configuración del puerto
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  console.log(`WebSocket disponible en ws://localhost:${PORT}/ws`);
});
