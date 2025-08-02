# 🏙️ Voz Urbana API

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)
[![Express.js](https://img.shields.io/badge/Express.js-4.18-black.svg)](https://expressjs.com/)
[![Python](https://img.shields.io/badge/Python-3.8+-yellow.svg)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-orange.svg)](LICENSE)

Una plataforma integral para la gestión de reportes ciudadanos con capacidades de análisis inteligente y detección automática de zonas críticas mediante aprendizaje automático.

## 📋 Índice

- [Características principales](#-características-principales)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [API Endpoints](#-api-endpoints)
- [Modelo de Machine Learning](#-modelo-de-machine-learning)
- [Seeders y Datos de Prueba](#-seeders-y-datos-de-prueba)
- [WebSockets](#-websockets)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

## 🚀 Características principales

### 🎯 Gestión de Reportes
- ✅ **Creación de reportes** con geolocalización, categorías y prioridades
- ✅ **Sistema de estados** (nuevo, en proceso, resuelto, cerrado, no aprobado)
- ✅ **Carga de imágenes** con optimización automática
- ✅ **Sistema de comentarios** con interacción ciudadana
- ✅ **Votación de reportes** (upvote/downvote)

### 🤖 Inteligencia Artificial
- ✅ **Detección automática de zonas críticas** usando DBSCAN clustering
- ✅ **Modelo híbrido** con predicciones futuras de reportes
- ✅ **ETL automatizado** para procesamiento de datos
- ✅ **Generación de recomendaciones** basadas en análisis predictivo
- ✅ **Visualización de patrones** geoespaciales

### 👥 Gestión de Usuarios
- ✅ **Autenticación JWT** con roles (admin/ciudadano)
- ✅ **Sistema de puntos** por participación ciudadana
- ✅ **Perfiles de usuario** con historial de reportes

### 📊 Analytics y Reportes
- ✅ **Dashboard administrativo** con métricas en tiempo real
- ✅ **Gráficos de zonas críticas** generados automáticamente
- ✅ **Estadísticas por categorías** y tendencias temporales
- ✅ **Exportación de datos** en formato CSV

### 🔔 Notificaciones en Tiempo Real
- ✅ **WebSockets** para notificaciones instantáneas
- ✅ **Actualizaciones de estado** de reportes
- ✅ **Alertas de nuevos reportes** por zona

## 🛠️ Tecnologías

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **MySQL** - Base de datos relacional
- **Sequelize** - ORM para Node.js
- **JWT** - Autenticación y autorización
- **Multer** - Manejo de archivos
- **WebSocket** - Comunicación en tiempo real

### Machine Learning
- **Python 3.8+** - Lenguaje para ML
- **scikit-learn** - Algoritmos de aprendizaje automático
- **DBSCAN** - Clustering para zonas críticas
- **Random Forest** - Modelo predictivo
- **matplotlib/seaborn** - Visualización de datos
- **pandas/numpy** - Procesamiento de datos

### Documentación
- **Swagger/OpenAPI 3.0** - Documentación interactiva de la API

## 📦 Instalación

### Prerrequisitos
```bash
# Node.js 18+
node --version

# Python 3.8+
python --version

# MySQL 8.0+
mysql --version
```

### 1. Clonar el repositorio
```bash
git clone https://github.com/CarlosJ67/Backend-Voz-Urbana.git
cd Backend-Voz-Urbana
```

### 2. Instalar dependencias de Node.js
```bash
npm install
```

### 3. Instalar dependencias de Python
```bash
pip install -r requirements.txt
```

### 4. Configurar la base de datos
```bash
# Crear base de datos MySQL
mysql -u root -p
CREATE DATABASE voz_urbana;
exit
```

## ⚙️ Configuración

### 1. Variables de entorno
```bash
# Crear archivo .env
cp .env.example .env
```

Configurar las variables en `.env`:
```env
# Base de datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=voz_urbana
DB_PORT=3306

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro

# Puerto del servidor
PORT=3000
```

### 2. Configuración de base de datos
El archivo `config/database.js` contiene la configuración de Sequelize:

```javascript
module.exports = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'voz_urbana',
  port: process.env.DB_PORT || 3306
};
```

## 🚀 Uso

### 1. Iniciar el servidor
```bash
npm start
```

El servidor estará disponible en:
- **API REST**: `http://localhost:3000`
- **WebSocket**: `ws://localhost:3000/ws`
- **Documentación**: `http://localhost:3000/api-docs`

### 2. Inicialización automática
El sistema inicializa automáticamente:
- ✅ Tablas de la base de datos
- ✅ Categorías predefinidas (9 categorías)
- ✅ Usuario administrador por defecto

**Credenciales de admin por defecto:**
- Email: `admin@vozUrbana.com`
- Password: `12345678`

## 📡 API Endpoints

### 🔐 Autenticación
```http
POST /api/auth/register     # Registro de usuario
POST /api/auth/login        # Inicio de sesión
```

### 📋 Reportes
```http
GET    /api/reports                    # Obtener todos los reportes
POST   /api/reports                    # Crear nuevo reporte
GET    /api/reports/:id                # Obtener reporte por ID
PATCH  /api/reports/:id                # Actualizar reporte
DELETE /api/reports/:id                # Eliminar reporte
GET    /api/reports/user/:userId       # Reportes por usuario
GET    /api/reports/location/:lat/:lng/:radius  # Reportes por ubicación
PATCH  /api/reports/admin/status/:id   # Cambiar estado (admin)
```

### 🏷️ Categorías
```http
GET    /api/categorias        # Obtener categorías
POST   /api/categorias        # Crear categoría (admin)
PATCH  /api/categorias/:id    # Actualizar categoría (admin)
DELETE /api/categorias/:id    # Eliminar categoría (admin)
```

### 💬 Comentarios
```http
GET    /api/comentarios/:reporte_id    # Comentarios por reporte
POST   /api/comentarios                # Crear comentario
PATCH  /api/comentarios/:id            # Actualizar comentario
DELETE /api/comentarios/:id            # Eliminar comentario
```

### 👍 Votación
```http
POST   /api/votos/up          # Voto positivo
POST   /api/votos/down        # Voto negativo
GET    /api/votos/:reporte_id # Obtener votos de reporte
```

### 🛠️ Utilidades (Testing)
```http
POST   /api/utils/generar-usuarios-lote      # Generar usuarios de prueba
POST   /api/utils/generar-reportes-lote      # Generar reportes de prueba
POST   /api/utils/generar-comentarios-lote   # Generar comentarios de prueba
POST   /api/utils/ejecutar-etl-reportes      # Ejecutar ETL y modelo ML
```

## 🤖 Modelo de Machine Learning

### Algoritmo Principal: DBSCAN
El sistema utiliza **DBSCAN (Density-Based Spatial Clustering)** para detectar automáticamente zonas críticas:

```python
# Archivo: seeders/aprendizaje_no_supervisado.py
from sklearn.cluster import DBSCAN

# Configuración optimizada
dbscan = DBSCAN(
    eps=0.008,           # Radio de búsqueda
    min_samples=3,       # Mínimo de reportes por cluster
    metric='euclidean'   # Métrica de distancia
)
```

### Características del Modelo
- **🎯 No supervisado**: No requiere zonas predefinidas
- **📍 Geoespacial**: Analiza coordenadas lat/lng
- **⚡ Automático**: Detecta número óptimo de clusters
- **🔄 Adaptativo**: Se ajusta a nuevos datos

### Modelo Híbrido Predictivo
Adicionalmente incluye predicciones futuras usando **Random Forest**:

```python
# Predicción de reportes por zona
from sklearn.ensemble import RandomForestRegressor

# Características: temporales, geográficas, categóricas
# Predicción: cantidad de reportes esperados
```

### Ejecución del Modelo
```bash
# ETL + Modelo automático
curl -X POST http://localhost:3000/api/utils/ejecutar-etl-reportes

# Manual con archivo específico
python seeders/aprendizaje_no_supervisado.py ruta/archivo.csv
```

### Salidas del Modelo
- **📊 Gráfico**: `graficos/zonas_criticas_*.png`
- **💾 Modelo**: `modelos/zonas_criticas_*.joblib`
- **📈 Métricas**: Silhouette score, número de clusters, R²
- **🔮 Predicciones**: Reportes futuros por zona (7 semanas)

## 🌱 Seeders y Datos de Prueba

### Generación Inteligente de Datos
El sistema incluye seeders avanzados que generan datos realistas para entrenar el modelo:

#### 👥 Usuarios
```bash
# Generar usuarios de prueba
python seeders/seeder_usuarios.py [admins] [ciudadanos] [offset]

# Ejemplo: 5 admins + 10,000 ciudadanos
python seeders/seeder_usuarios.py 5 10000 0
```

#### 📋 Reportes Inteligentes
```bash
# Generar reportes con patrones realistas
python seeders/seeder_reportes.py [total] [offset] [fecha_inicio] [fecha_fin]

# Ejemplo: 100,000 reportes del último año
python seeders/seeder_reportes.py 100000 0 "2024-01-01" "2024-12-31"
```

**Características de los reportes generados:**
- 🎯 **Clustering natural**: 85% cerca de puntos de interés
- 📊 **Prioridades contextuales**: Más alta prioridad en zonas densas
- 🕐 **Patrones temporales**: Más reportes en horarios laborales
- 🏷️ **Categorías realistas**: Distribución inteligente por contexto

#### 💬 Comentarios
```bash
# Generar comentarios contextual
python seeders/seeder_comentarios.py [total] [offset]
```

### Datos Geográficos Reales
Los seeders utilizan datos reales de **Xicotepec de Juárez, Puebla**:
- ✅ 38 colonias oficiales (INEGI 2023)
- ✅ 120+ calles verificadas (OpenStreetMap)
- ✅ 20 puntos de referencia reales
- ✅ Coordenadas GPS precisas

## 🔔 WebSockets

### Conexión
```javascript
const ws = new WebSocket('ws://localhost:3000/ws');

ws.onopen = () => {
    console.log('Conectado a Voz Urbana');
    // Suscribirse a notificaciones
    ws.send(JSON.stringify({ type: 'subscribe' }));
};

ws.onmessage = (event) => {
    const notification = JSON.parse(event.data);
    console.log('Notificación:', notification);
};
```

### Tipos de Notificaciones
```javascript
// Nuevo reporte
{
    type: 'new_report',
    data: {
        reportId: 123,
        titulo: 'Bache en Av. Juárez',
        prioridad: 'alta',
        usuario: 'Juan Pérez'
    }
}

// Cambio de estado
{
    type: 'status_change',
    data: {
        reportId: 123,
        oldStatus: 'nuevo',
        newStatus: 'en_proceso'
    }
}

// Reportes pendientes
{
    type: 'pending_reports',
    data: {
        count: 15,
        message: 'Tienes 15 reportes pendientes'
    }
}
```

## 📁 Estructura del Proyecto

```
voz-urbana-api/
├── 📄 server.js                    # Servidor principal
├── 📄 websocket.js                 # Configuración WebSocket
├── 📄 swagger.js                   # Documentación API
├── 📄 package.json                 # Dependencias Node.js
├── 📄 requirements.txt             # Dependencias Python
├── 📄 README.md                    # Este archivo
├── 📁 config/                      # Configuración
│   ├── database.js                 # Conexión MySQL
│   ├── initDatabase.js             # Inicialización DB
│   └── jwt.js                      # Configuración JWT
├── 📁 controllers/                 # Lógica de negocio
│   ├── authController.js           # Autenticación
│   ├── reportsController.js        # Reportes
│   ├── CategoriasController.js     # Categorías
│   ├── comentarioController.js     # Comentarios
│   ├── votosController.js          # Sistema de votos
│   └── utils*Controller.js         # Utilidades/Seeders
├── 📁 middleware/                  # Middleware Express
│   ├── auth.js                     # Autenticación JWT
│   ├── isAdmin.js                  # Verificación admin
│   └── upload.js                   # Carga de archivos
├── 📁 models/                      # Modelos Sequelize
│   ├── index.js                    # Configuración modelos
│   ├── User.js                     # Modelo Usuario
│   ├── Report.js                   # Modelo Reporte
│   ├── Categoria.js                # Modelo Categoría
│   ├── Comentario.js               # Modelo Comentario
│   └── Voto.js                     # Modelo Voto
├── 📁 routes/                      # Rutas API
│   ├── auth.js                     # Rutas autenticación
│   ├── reports.js                  # Rutas reportes
│   ├── categorias.js               # Rutas categorías
│   ├── comentarios.js              # Rutas comentarios
│   ├── votos.js                    # Rutas votación
│   ├── utils.js                    # Rutas utilidades
│   └── test.js                     # Rutas testing
├── 📁 seeders/                     # Datos de prueba y ML
│   ├── 🐍 seeder_usuarios.py       # Generador usuarios
│   ├── 🐍 seeder_reportes.py       # Generador reportes
│   ├── 🐍 seeder_comentarios.py    # Generador comentarios
│   ├── 🐍 aprendizaje_no_supervisado.py  # Modelo ML principal
│   ├── 🐍 etl_reportes.py          # ETL procesamiento
│   └── demo-*.js                   # Seeders legacy
├── 📁 uploads/                     # Archivos subidos
│   └── reports/                    # Imágenes de reportes
├── 📁 exports/                     # Datos exportados
│   └── etl_data/                   # CSVs procesados
├── 📁 graficos/                    # Visualizaciones ML
│   └── zonas_criticas_*.png        # Gráficos generados
├── 📁 modelos/                     # Modelos entrenados
│   └── zonas_criticas_*.joblib     # Modelos guardados
└── 📁 migrations/                  # Migraciones DB (futuro)
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm start              # Iniciar servidor
npm run dev            # Modo desarrollo (nodemon)

# Base de datos
npm run db:migrate     # Ejecutar migraciones
npm run db:seed        # Ejecutar seeders

# Testing
npm test               # Ejecutar tests
npm run test:watch     # Tests en modo watch

# Producción
npm run build          # Build para producción
npm run start:prod     # Iniciar en producción
```

## 🎯 Casos de Uso

### 👨‍💼 Para Administradores
1. **Monitoreo de reportes** en tiempo real
2. **Gestión de estados** y asignaciones
3. **Análisis de zonas críticas** automático
4. **Exportación de datos** para informes
5. **Predicciones futuras** para planificación

### 👥 Para Ciudadanos
1. **Reportar problemas** con geolocalización
2. **Seguimiento de reportes** propios
3. **Comentar y votar** otros reportes
4. **Recibir notificaciones** de actualizaciones
5. **Ganar puntos** por participación

### 🤖 Para Desarrolladores
1. **API REST completa** con documentación
2. **Seeders inteligentes** para testing
3. **Modelo ML integrado** para analytics
4. **WebSockets** para tiempo real
5. **Arquitectura escalable** y modular

## 📊 Métricas y Analytics

### Dashboard Disponible
- 📈 **Reportes por estado**: nuevos, en proceso, resueltos
- 🗺️ **Mapa de calor**: zonas con más incidencias
- 📊 **Categorías populares**: tipos de problemas más reportados
- ⏰ **Tendencias temporales**: patrones por hora/día/semana
- 🎯 **Zonas críticas**: clusters detectados automáticamente

### Métricas del Modelo ML
```json
{
  "silhouette_score": 0.742,      // Calidad del clustering
  "n_clusters": 5,                // Zonas críticas detectadas
  "cobertura_poblacion": 67.3,    // % reportes en clusters
  "r2_prediccion": 0.845,         // Precisión predicciones
  "mae_prediccion": 2.1           // Error medio absoluto
}
```

## 🔒 Seguridad

### Autenticación
- ✅ **JWT tokens** con expiración configurable
- ✅ **Roles de usuario** (admin/ciudadano)
- ✅ **Validación de entrada** en todos los endpoints
- ✅ **Sanitización** de datos de usuario

### Autorización
- ✅ **Middleware de autenticación** en rutas protegidas
- ✅ **Verificación de roles** para operaciones admin
- ✅ **Ownership validation** (usuarios solo pueden editar sus reportes)

### Datos
- ✅ **Validación de archivos** subidos
- ✅ **Límites de tamaño** para uploads
- ✅ **Escape de SQL** vía Sequelize ORM
- ✅ **Encriptación de passwords** con bcrypt

## 🚀 Deployment

### Variables de Producción
```env
NODE_ENV=production
PORT=3000
DB_HOST=tu-servidor-mysql
DB_USER=usuario_prod
DB_PASSWORD=password_seguro
JWT_SECRET=jwt_secret_muy_largo_y_seguro
```

### Docker (Opcional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Nginx Reverse Proxy
```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## 🤝 Contribución

### Pasos para contribuir
1. **Fork** el repositorio
2. **Crear** una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. **Commit** tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. **Push** a la rama (`git push origin feature/nueva-funcionalidad`)
5. **Crear** un Pull Request

### Estándares de código
- ✅ **ESLint** para JavaScript
- ✅ **Prettier** para formateo
- ✅ **Conventional Commits** para mensajes
- ✅ **Jest** para testing

### Estructura de commits
```bash
feat: agregar endpoint de estadísticas
fix: corregir error en validación de coordenadas
docs: actualizar documentación API
test: agregar tests para modelo ML
```

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE para detalles.

## 🙏 Agradecimientos

- **INEGI** por los datos geográficos de Xicotepec
- **OpenStreetMap** por la cartografía colaborativa
- **scikit-learn** por los algoritmos de ML
- **Express.js** por el framework web
- **MySQL** por la base de datos robusta

## 📞 Contacto

- **Desarrollador**: Carlos J.
- **GitHub**: [@CarlosJ67](https://github.com/CarlosJ67)
- **Repositorio**: [Backend-Voz-Urbana](https://github.com/CarlosJ67/Backend-Voz-Urbana)

---

<div align="center">

**⭐ Si este proyecto te resultó útil, considera darle una estrella**

Desarrollado con ❤️ para mejorar las ciudades mediante la participación ciudadana

</div>