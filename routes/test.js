const express = require('express');
const router = express.Router();

// Obtener la instancia de WebSocket desde el servidor principal
let notificationWS = null;

const setNotificationWS = (ws) => {
  notificationWS = ws;
};

// Endpoint para probar nueva notificación de reporte
router.post('/new-report', (req, res) => {
  try {
    const { title, description, userId, categoriaId } = req.body;
    
    if (!notificationWS) {
      return res.status(500).json({ 
        success: false, 
        message: 'WebSocket no está inicializado' 
      });
    }

    // Simular datos del reporte
    const mockReport = {
      id: Math.floor(Math.random() * 1000) + 1,
      titulo: title || 'Reporte de Prueba',
      descripcion: description || 'Descripción de prueba',
      estado: 'pendiente',
      categoria: { nombre: 'Infraestructura' },
      usuario: { nombre: 'Usuario de Prueba' },
      createdAt: new Date().toISOString()
    };

    // Enviar notificación WebSocket
    notificationWS.notifyNewReport(mockReport);
    
    console.log('📢 Notificación de nuevo reporte enviada:', mockReport.titulo);
    
    res.json({
      success: true,
      message: 'Notificación de nuevo reporte enviada',
      report: mockReport
    });
  } catch (error) {
    console.error('Error enviando notificación de nuevo reporte:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
});

// Endpoint para probar cambio de estado
router.post('/status-change', (req, res) => {
  try {
    const { reportId, status } = req.body;
    
    if (!notificationWS) {
      return res.status(500).json({ 
        success: false, 
        message: 'WebSocket no está inicializado' 
      });
    }

    // Simular datos del reporte actualizado
    const mockReport = {
      id: reportId || 1,
      titulo: 'Reporte de Prueba Actualizado',
      descripcion: 'Este reporte ha cambiado de estado',
      estado: status || 'en_proceso',
      categoria: { nombre: 'Infraestructura' },
      usuario: { nombre: 'Usuario de Prueba' },
      updatedAt: new Date().toISOString()
    };

    // Enviar notificación WebSocket
    notificationWS.notifyStatusChange(mockReport, status);
    
    console.log(`🔄 Notificación de cambio de estado enviada: ${mockReport.titulo} -> ${status}`);
    
    res.json({
      success: true,
      message: 'Notificación de cambio de estado enviada',
      report: mockReport,
      newStatus: status
    });
  } catch (error) {
    console.error('Error enviando notificación de cambio de estado:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
});

// Endpoint para probar notificación de reportes pendientes
router.post('/pending-reports', (req, res) => {
  try {
    if (!notificationWS) {
      return res.status(500).json({ 
        success: false, 
        message: 'WebSocket no está inicializado' 
      });
    }

    const pendingCount = Math.floor(Math.random() * 10) + 1;
    
    // Enviar notificación WebSocket
    notificationWS.notifyPendingReports(pendingCount);
    
    console.log(`📋 Notificación de reportes pendientes enviada: ${pendingCount} reportes`);
    
    res.json({
      success: true,
      message: 'Notificación de reportes pendientes enviada',
      pendingCount: pendingCount
    });
  } catch (error) {
    console.error('Error enviando notificación de reportes pendientes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
});

// Endpoint para probar conectividad
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API de pruebas funcionando correctamente',
    websocket: notificationWS ? 'Conectado' : 'No disponible',
    timestamp: new Date().toISOString()
  });
});

module.exports = { router, setNotificationWS };
