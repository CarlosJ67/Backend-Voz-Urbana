const Incidencia = require('../models/Incidencia');
const { erroresAplicacion } = require('./metrics');

const logIncidencia = async (error, req, tipoError = 'error') => {
  try {
    const incidenciaData = {
      tipo: tipoError,
      modulo: req.route ? req.route.path.split('/')[1] : 'unknown',
      mensaje: error.message || 'Error desconocido',
      stack_trace: error.stack,
      usuario_id: req.user ? req.user.id : null,
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.get('User-Agent'),
      endpoint: req.originalUrl,
      metodo_http: req.method,
      datos_adicionales: {
        body: req.body,
        query: req.query,
        params: req.params,
        timestamp: new Date().toISOString()
      }
    };

    await Incidencia.create(incidenciaData);
    
    // Incrementar métrica de errores
    erroresAplicacion.labels(tipoError, req.originalUrl).inc();

    console.error(`🚨 Incidencia registrada: ${error.message}`, {
      endpoint: req.originalUrl,
      usuario: req.user?.id || 'anónimo',
      ip: incidenciaData.ip_address
    });
  } catch (logError) {
    console.error('Error al registrar incidencia:', logError);
  }
};

const errorHandler = (error, req, res, next) => {
  // Registrar la incidencia
  logIncidencia(error, req, 'error');

  // Determinar el tipo de error y respuesta
  let statusCode = 500;
  let message = 'Error interno del servidor';

  if (error.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Error de validación en los datos';
  } else if (error.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'El recurso ya existe';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token inválido';
  } else if (error.message.includes('not found')) {
    statusCode = 404;
    message = 'Recurso no encontrado';
  }

  res.status(statusCode).json({
    error: true,
    message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: error.stack,
      details: error.message 
    })
  });
};

module.exports = { errorHandler, logIncidencia };