// middleware/metrics.js
const responseTime = require('response-time');
const prometheus = require('prom-client');

// Crear registro de métricas
const register = new prometheus.Registry();

// Métricas personalizadas
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duración de las peticiones HTTP en milisegundos',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 5, 15, 50, 100, 500, 1000]
});

const httpRequestsTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Número total de peticiones HTTP',
  labelNames: ['method', 'route', 'status_code']
});

const activeConnections = new prometheus.Gauge({
  name: 'active_connections',
  help: 'Número de conexiones activas'
});

const reportesCreados = new prometheus.Counter({
  name: 'reportes_creados_total',
  help: 'Número total de reportes creados'
});

const erroresAplicacion = new prometheus.Counter({
  name: 'errores_aplicacion_total',
  help: 'Número total de errores de aplicación',
  labelNames: ['tipo', 'endpoint']
});

// Registrar métricas
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);
register.registerMetric(activeConnections);
register.registerMetric(reportesCreados);
register.registerMetric(erroresAplicacion);

// Middleware para capturar métricas
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const route = req.route ? req.route.path : req.path;
    
    httpRequestDuration
      .labels(req.method, route, res.statusCode)
      .observe(duration);
    
    httpRequestsTotal
      .labels(req.method, route, res.statusCode)
      .inc();
  });
  
  next();
};

module.exports = {
  register,
  metricsMiddleware,
  reportesCreados,
  erroresAplicacion,
  activeConnections
};