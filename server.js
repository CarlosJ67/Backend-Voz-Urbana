require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const cors = require('cors');
const app = express();
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const categoriasRoutes = require('./routes/categorias');
const comentariosRoutes = require('./routes/comentarios');
const votosRoutes = require('./routes/votos');

// Middlewares 
app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/comentarios', comentariosRoutes);
app.use('/api/votos', votosRoutes);


const db = require('./config/database');

// Test de conexión a la base de datos
db.authenticate()
  .then(() => console.log('Conexión a la base de datos establecida'))
  .catch(err => console.error('Error al conectar a la base de datos:', err));

// Test de conexión y sincronización de modelos
db.authenticate()
  .then(() => {
    console.log('Conexión a la base de datos establecida');
    return db.sync({ alter: true });
  })
  .then(() => console.log('Modelos sincronizados con la base de datos'))
  .catch(err => console.error('Error al conectar a la base de datos:', err));
  
// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API de Voz Urbana funcionando' });
});

// Configuración del puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});