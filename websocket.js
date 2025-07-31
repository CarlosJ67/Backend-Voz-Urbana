const WebSocket = require('ws');
const { Report } = require('./models');

class NotificationWebSocket {
  constructor(server) {
    this.wss = new WebSocket.Server({ 
      server,
      path: '/ws'
    });
    
    this.clients = new Set();
    this.setupWebSocket();
  }

  setupWebSocket() {
    this.wss.on('connection', (ws, req) => {
      console.log('Nueva conexión WebSocket establecida');
      this.clients.add(ws);

      // Enviar mensaje de bienvenida
      ws.send(JSON.stringify({
        type: 'connected',
        message: 'Conectado al servicio de notificaciones Voz Urbana'
      }));

      // Manejar mensajes del cliente
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this.handleClientMessage(ws, data);
        } catch (error) {
          console.error('Error al procesar mensaje del cliente:', error);
        }
      });

      // Limpiar cuando se desconecta
      ws.on('close', () => {
        console.log('Cliente WebSocket desconectado');
        this.clients.delete(ws);
      });

      // Manejar errores
      ws.on('error', (error) => {
        console.error('Error en WebSocket:', error);
        this.clients.delete(ws);
      });
    });
  }

  handleClientMessage(ws, data) {
    switch (data.type) {
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' }));
        break;
      case 'subscribe':
        // El cliente se suscribe a notificaciones
        ws.isSubscribed = true;
        break;
      case 'unsubscribe':
        ws.isSubscribed = false;
        break;
      default:
        console.log('Mensaje no reconocido:', data);
    }
  }

  // Notificar a todos los clientes conectados sobre un nuevo reporte
  notifyNewReport(report) {
    const notification = {
      type: 'new_report',
      data: {
        reportId: report.id,
        titulo: report.titulo,
        descripcion: report.descripcion,
        prioridad: report.prioridad,
        fechaCreacion: report.fecha_creacion,
        usuario: report.User?.nombre || 'Usuario desconocido'
      },
      timestamp: new Date().toISOString()
    };

    this.broadcast(notification);
  }

  // Notificar cambio de estado de reporte
  notifyStatusChange(report, oldStatus, newStatus) {
    const notification = {
      type: 'status_change',
      data: {
        reportId: report.id,
        titulo: report.titulo,
        oldStatus,
        newStatus,
        timestamp: new Date().toISOString()
      }
    };

    this.broadcast(notification);
  }

  // Enviar notificación de resumen de reportes pendientes
  async notifyPendingReports() {
    try {
      const pendingReports = await Report.count({
        where: { estado: 'nuevo' }
      });

      const notification = {
        type: 'pending_reports',
        data: {
          count: pendingReports,
          message: `Tienes ${pendingReports} reportes pendientes por revisar`
        },
        timestamp: new Date().toISOString()
      };

      this.broadcast(notification);
    } catch (error) {
      console.error('Error al obtener reportes pendientes:', error);
    }
  }

  // Enviar mensaje a todos los clientes suscritos
  broadcast(message) {
    const messageString = JSON.stringify(message);
    
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN && client.isSubscribed) {
        try {
          client.send(messageString);
        } catch (error) {
          console.error('Error al enviar mensaje a cliente:', error);
          this.clients.delete(client);
        }
      }
    });

    console.log(`Notificación enviada a ${this.clients.size} clientes:`, message.type);
  }

  // Obtener estadísticas de conexiones
  getStats() {
    return {
      totalClients: this.clients.size,
      subscribedClients: Array.from(this.clients).filter(client => client.isSubscribed).length
    };
  }
}

module.exports = NotificationWebSocket;
