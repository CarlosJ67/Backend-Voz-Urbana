require("dotenv").config();
const express = require("express");
const http = require("http");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const cors = require("cors");
const path = require("path");
const compression = require('compression');
const fs = require('fs');

const app = express();
const server = http.createServer(app);

const authRoutes = require("./routes/auth");
const reportRoutes = require("./routes/reports");
const categoriasRoutes = require("./routes/categorias");
const comentariosRoutes = require("./routes/comentarios");
const votosRoutes = require("./routes/votos");
const utilsRoutes = require("./routes/utils");
const { register, metricsMiddleware } = require('./middleware/metrics');

// Middlewares
app.use(cors());
app.use(express.json());
app.use(compression());
app.use(metricsMiddleware);

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1y',
  etag: true,
  lastModified: true
}));

// === RUTAS PRINCIPALES ===
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/categorias", categoriasRoutes);
app.use("/api/comentarios", comentariosRoutes);
app.use("/api/votos", votosRoutes);
app.use("/api/utils", utilsRoutes);

const db = require("./config/database");
const initDatabase = require("./config/initDatabase");

// Inicialización de base de datos
initDatabase()
  .then(() => {
    console.log("🚀 Inicialización de base de datos completada");
  })
  .catch((err) => {
    console.error("💥 Error en la inicialización:", err);
    process.exit(1);
  });

// === ENDPOINTS PARA PRUEBAS ===

// Ruta principal con información del sistema
app.get("/", (req, res) => {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://backend-voz-urbana.onrender.com' 
    : `http://localhost:${process.env.PORT || 3000}`;
    
  res.json({
    message: "🏙️ API de Voz Urbana funcionando",
    version: "1.0.0",
    environment: process.env.NODE_ENV || 'development',
    documentation: `${baseUrl}/api-docs`,
    testing: {
      performance: `${baseUrl}/api/test/performance`,
      stress: `${baseUrl}/api/test/stress`,
      health: `${baseUrl}/api/test/health`
    },
    metrics: {
      dashboard: `${baseUrl}/api/metrics/dashboard`,
      prometheus: `${baseUrl}/metrics`
    },
    timestamp: new Date().toISOString()
  });
});

// Health Check completo
app.get("/api/test/health", async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { Report, User, Categoria } = require('./models');
    
    // Test de conectividad a BD
    const dbStart = Date.now();
    await db.authenticate();
    const dbTime = Date.now() - dbStart;
    
    // Test de consultas básicas
    const queryStart = Date.now();
    const [reportCount, userCount, categoriaCount] = await Promise.all([
      Report.count(),
      User.count(),
      Categoria.count()
    ]);
    const queryTime = Date.now() - queryStart;
    
    const totalTime = Date.now() - startTime;
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: {
          status: 'connected',
          responseTime: `${dbTime}ms`
        },
        queries: {
          status: 'working',
          responseTime: `${queryTime}ms`,
          results: { reportCount, userCount, categoriaCount }
        },
        api: {
          status: 'responding',
          totalResponseTime: `${totalTime}ms`
        }
      },
      metrics: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version
      }
    });
  } catch (error) {
    const totalTime = Date.now() - startTime;
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      responseTime: `${totalTime}ms`,
      timestamp: new Date().toISOString()
    });
  }
});

// Test de Performance - Múltiples operaciones
app.get("/api/test/performance", async (req, res) => {
  const results = {
    testId: `perf_${Date.now()}`,
    timestamp: new Date().toISOString(),
    tests: {}
  };

  try {
    const { Report, User, Categoria } = require('./models');

    // Test 1: Consulta simple
    console.log('🔄 Ejecutando test de consulta simple...');
    const simpleStart = Date.now();
    const reportes = await Report.findAll({ limit: 10 });
    results.tests.simpleQuery = {
      name: 'Consulta Simple (10 reportes)',
      duration: Date.now() - simpleStart,
      resultCount: reportes.length,
      status: 'success'
    };

    // Test 2: Consulta compleja con JOIN
    console.log('🔄 Ejecutando test de consulta compleja...');
    const complexStart = Date.now();
    const reportesComplejos = await Report.findAll({
      include: [
        { model: User, attributes: ['nombre', 'email'] },
        { model: Categoria, attributes: ['nombre', 'icono'] }
      ],
      limit: 50,
      order: [['fecha_creacion', 'DESC']]
    });
    results.tests.complexQuery = {
      name: 'Consulta Compleja (50 reportes con JOIN)',
      duration: Date.now() - complexStart,
      resultCount: reportesComplejos.length,
      status: 'success'
    };

    // Test 3: Agregaciones
    console.log('🔄 Ejecutando test de agregaciones...');
    const aggStart = Date.now();
    const estadisticas = await Promise.all([
      Report.count(),
      Report.count({ where: { estado: 'nuevo' } }),
      User.count({ where: { activo: true } })
    ]);
    results.tests.aggregations = {
      name: 'Consultas de Agregación',
      duration: Date.now() - aggStart,
      results: {
        totalReportes: estadisticas[0],
        reportesNuevos: estadisticas[1],
        usuariosActivos: estadisticas[2]
      },
      status: 'success'
    };

    // Test 4: Múltiples consultas concurrentes
    console.log('🔄 Ejecutando test de concurrencia...');
    const concurrentStart = Date.now();
    const promises = [];
    for (let i = 0; i < 10; i++) {
      promises.push(Report.findAll({ limit: 5, offset: i * 5 }));
    }
    const concurrentResults = await Promise.all(promises);
    results.tests.concurrentQueries = {
      name: 'Consultas Concurrentes (10 simultáneas)',
      duration: Date.now() - concurrentStart,
      queriesExecuted: promises.length,
      totalResults: concurrentResults.reduce((sum, result) => sum + result.length, 0),
      status: 'success'
    };

    // Resumen de performance
    const totalDuration = Object.values(results.tests).reduce((sum, test) => sum + test.duration, 0);
    results.summary = {
      totalTests: Object.keys(results.tests).length,
      totalDuration: `${totalDuration}ms`,
      averageResponseTime: `${Math.round(totalDuration / Object.keys(results.tests).length)}ms`,
      status: 'completed'
    };

    console.log('✅ Test de performance completado');
    res.json(results);

  } catch (error) {
    results.error = {
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
    results.status = 'failed';
    console.error('❌ Error en test de performance:', error);
    res.status(500).json(results);
  }
});

// Test de Estrés - Carga de datos masiva
app.post("/api/test/stress", async (req, res) => {
  const { 
    reportes = 100,
    usuarios = 10,
    concurrency = 5,
    downloadReport = false 
  } = req.body;

  const testId = `stress_${Date.now()}`;
  const results = {
    testId,
    timestamp: new Date().toISOString(),
    config: { reportes, usuarios, concurrency },
    results: {},
    logs: []
  };

  // Función para log con timestamp
  const log = (message) => {
    const logEntry = `${new Date().toISOString()}: ${message}`;
    console.log(logEntry);
    results.logs.push(logEntry);
  };

  try {
    const { Report, User, Categoria } = require('./models');
    
    log(`🚀 Iniciando test de estrés: ${reportes} reportes, ${usuarios} usuarios, concurrencia: ${concurrency}`);

    // Obtener categorías existentes
    const categorias = await Categoria.findAll();
    if (categorias.length === 0) {
      throw new Error('No hay categorías disponibles');
    }

    // FASE 1: Crear usuarios de prueba
    log(`📝 Creando ${usuarios} usuarios de prueba...`);
    const userStart = Date.now();
    const usuariosPrueba = [];
    
    for (let i = 0; i < usuarios; i++) {
      try {
        const user = await User.create({
          nombre: `Usuario Stress ${i}`,
          email: `stress${i}_${Date.now()}@test.com`,
          password_hash: 'hash_test',
          rol: 'ciudadano',
          activo: true
        });
        usuariosPrueba.push(user);
      } catch (error) {
        log(`⚠️ Error creando usuario ${i}: ${error.message}`);
      }
    }
    
    results.results.userCreation = {
      planned: usuarios,
      created: usuariosPrueba.length,
      duration: Date.now() - userStart,
      status: usuariosPrueba.length > 0 ? 'success' : 'failed'
    };
    
    log(`✅ Usuarios creados: ${usuariosPrueba.length}/${usuarios}`);

    // FASE 2: Crear reportes en lotes con concurrencia controlada
    log(`📝 Creando ${reportes} reportes en lotes de ${concurrency}...`);
    const reportStart = Date.now();
    let reportesCreados = 0;
    let erroresReportes = 0;
    
    // Dividir en lotes
    const lotes = Math.ceil(reportes / concurrency);
    
    for (let lote = 0; lote < lotes; lote++) {
      const loteStart = Date.now();
      const promesasLote = [];
      
      for (let i = 0; i < concurrency && (lote * concurrency + i) < reportes; i++) {
        const reporteIndex = lote * concurrency + i;
        const usuario = usuariosPrueba[reporteIndex % usuariosPrueba.length];
        const categoria = categorias[reporteIndex % categorias.length];
        
        const promesa = Report.create({
          titulo: `Reporte Stress ${reporteIndex}`,
          descripcion: `Descripción del reporte de estrés número ${reporteIndex} creado para testing`,
          categoria_id: categoria.id,
          usuario_id: usuario.id,
          latitud: 19.4326 + (Math.random() - 0.5) * 0.1,
          longitud: -99.1332 + (Math.random() - 0.5) * 0.1,
          ubicacion: `Ubicación Test ${reporteIndex}`,
          estado: 'nuevo',
          prioridad: ['baja', 'media', 'alta'][reporteIndex % 3]
        }).then(() => {
          reportesCreados++;
        }).catch(error => {
          erroresReportes++;
          log(`⚠️ Error en reporte ${reporteIndex}: ${error.message}`);
        });
        
        promesasLote.push(promesa);
      }
      
      await Promise.allSettled(promesasLote);
      const loteTime = Date.now() - loteStart;
      
      if (lote % 10 === 0) { // Log cada 10 lotes
        log(`📊 Lote ${lote + 1}/${lotes} completado en ${loteTime}ms`);
      }
    }
    
    results.results.reportCreation = {
      planned: reportes,
      created: reportesCreados,
      errors: erroresReportes,
      duration: Date.now() - reportStart,
      throughput: Math.round(reportesCreados / ((Date.now() - reportStart) / 1000)),
      status: reportesCreados > 0 ? 'success' : 'failed'
    };
    
    log(`✅ Reportes creados: ${reportesCreados}/${reportes}, Errores: ${erroresReportes}`);

    // FASE 3: Test de lectura masiva
    log(`🔍 Ejecutando test de lectura masiva...`);
    const readStart = Date.now();
    let lecturas = 0;
    
    try {
      // Leer reportes en páginas
      for (let pagina = 0; pagina < 10; pagina++) {
        const reportesPagina = await Report.findAll({
          include: [
            { model: User, attributes: ['nombre'] },
            { model: Categoria, attributes: ['nombre'] }
          ],
          limit: 50,
          offset: pagina * 50,
          order: [['fecha_creacion', 'DESC']]
        });
        lecturas += reportesPagina.length;
      }
      
      results.results.massiveRead = {
        recordsRead: lecturas,
        duration: Date.now() - readStart,
        throughput: Math.round(lecturas / ((Date.now() - readStart) / 1000)),
        status: 'success'
      };
    } catch (error) {
      results.results.massiveRead = {
        error: error.message,
        duration: Date.now() - readStart,
        status: 'failed'
      };
      log(`❌ Error en lectura masiva: ${error.message}`);
    }

    // LIMPIEZA: Eliminar datos de prueba
    log(`🧹 Limpiando datos de prueba...`);
    const cleanupStart = Date.now();
    
    try {
      await Report.destroy({
        where: {
          titulo: {
            [require('sequelize').Op.like]: 'Reporte Stress%'
          }
        }
      });
      
      await User.destroy({
        where: {
          email: {
            [require('sequelize').Op.like]: 'stress%@test.com'
          }
        }
      });
      
      results.results.cleanup = {
        duration: Date.now() - cleanupStart,
        status: 'completed'
      };
      
      log(`✅ Limpieza completada`);
    } catch (error) {
      results.results.cleanup = {
        error: error.message,
        status: 'failed'
      };
      log(`⚠️ Error en limpieza: ${error.message}`);
    }

    // RESUMEN FINAL
    const totalDuration = Date.now() - new Date(results.timestamp).getTime();
    results.summary = {
      totalDuration: `${totalDuration}ms`,
      totalDurationMinutes: `${Math.round(totalDuration / 1000 / 60 * 100) / 100}min`,
      recordsProcessed: reportesCreados + lecturas,
      overallThroughput: Math.round((reportesCreados + lecturas) / (totalDuration / 1000)),
      status: 'completed',
      performance: reportesCreados > reportes * 0.8 ? 'good' : reportesCreados > reportes * 0.5 ? 'fair' : 'poor'
    };

    log(`🎯 Test de estrés completado: ${results.summary.performance} performance`);

    // Generar archivo de reporte si se solicita
    if (downloadReport) {
      const reportPath = path.join(__dirname, 'test-reports', `${testId}.json`);
      
      // Crear directorio si no existe
      const dir = path.dirname(reportPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
      
      results.downloadUrl = `/test-reports/${testId}.json`;
      log(`📄 Reporte guardado en: ${results.downloadUrl}`);
    }

    res.json(results);

  } catch (error) {
    log(`💥 Error crítico en test de estrés: ${error.message}`);
    results.error = {
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
    results.status = 'failed';
    res.status(500).json(results);
  }
});

// Endpoint para descargar reportes de testing
app.get("/test-reports/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'test-reports', filename);
  
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ error: 'Archivo no encontrado' });
  }
});

// Endpoint de métricas de Prometheus
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).end(error);
  }
});

// Endpoint de métricas personalizadas
app.get('/api/metrics/dashboard', async (req, res) => {
  try {
    const { Report, User, Categoria } = require('./models');
    const { Op } = require('sequelize');
    
    // Obtener estadísticas básicas
    const [
      totalReportes,
      reportesNuevos,
      reportesResueltos,
      totalUsuarios,
      usuariosActivos
    ] = await Promise.all([
      Report.count(),
      Report.count({ where: { estado: 'nuevo' } }),
      Report.count({ where: { estado: 'resuelto' } }),
      User.count(),
      User.count({ where: { activo: true } })
    ]);

    // Reportes por categoría
    const reportesPorCategoria = await Report.findAll({
      attributes: [
        'categoria_id',
        [db.fn('COUNT', db.col('categoria_id')), 'count']
      ],
      include: [{
        model: Categoria,
        attributes: ['nombre']
      }],
      group: ['categoria_id', 'Categoria.id']
    });

    // Reportes por estado en los últimos 30 días
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - 30);

    const reportesRecientes = await Report.findAll({
      attributes: [
        'estado',
        [db.fn('COUNT', db.col('estado')), 'count']
      ],
      where: {
        fecha_creacion: {
          [Op.gte]: fechaInicio
        }
      },
      group: ['estado']
    });

    res.json({
      resumen: {
        totalReportes,
        reportesNuevos,
        reportesResueltos,
        totalUsuarios,
        usuariosActivos,
        porcentajeResolucion: totalReportes > 0 ? Math.round((reportesResueltos / totalReportes) * 100) : 0
      },
      reportesPorCategoria,
      reportesRecientes,
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en métricas dashboard:', error);
    res.status(500).json({ 
      error: 'Error al obtener métricas', 
      message: error.message 
    });
  }
});

// Configuración del puerto
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📚 Documentación: http://localhost:${PORT}/api-docs`);
  console.log(`🧪 Test Performance: POST http://localhost:${PORT}/api/test/performance`);
  console.log(`💪 Test Estrés: POST http://localhost:${PORT}/api/test/stress`);
});