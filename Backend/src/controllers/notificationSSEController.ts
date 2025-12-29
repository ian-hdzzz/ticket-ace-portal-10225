import type { Request, Response } from 'express';

// Store para mantener las conexiones SSE activas
interface SSEClient {
  userId: string;
  response: Response;
}

const clients = new Set<SSEClient>();

/**
 * Controlador SSE para notificaciones en tiempo real
 */
export const notificationSSEController = {
  /**
   * Endpoint SSE que mantiene la conexión abierta
   * GET /api/notifications/stream
   */
  async streamNotifications(req: Request, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Configurar headers para SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Para Nginx

    // Enviar comentario inicial para establecer la conexión
    res.write(': connected\n\n');

    // Crear cliente y agregarlo al store
    const client: SSEClient = { userId, response: res };
    clients.add(client);

    console.log(`✅ SSE: Cliente conectado (userId: ${userId}). Total clientes: ${clients.size}`);

    // Enviar evento de conexión exitosa
    res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Conexión establecida' })}\n\n`);

    // Heartbeat cada 30 segundos para mantener la conexión viva
    const heartbeatInterval = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 30000);

    // Cleanup cuando el cliente se desconecta
    req.on('close', () => {
      clearInterval(heartbeatInterval);
      clients.delete(client);
      console.log(`❌ SSE: Cliente desconectado (userId: ${userId}). Total clientes: ${clients.size}`);
    });
  },

  /**
   * Emitir notificación a usuarios específicos
   * Llamado internamente desde el webhook
   */
  emitNotification(userIds: string[], notification: any) {
    let sentCount = 0;

    console.log("📤 emitNotification called");
    console.log("   Target userIds:", userIds);
    console.log("   Total connected clients:", clients.size);
    console.log("   Connected userIds:", Array.from(clients).map(c => c.userId));

    clients.forEach(client => {
      console.log(`   Checking client ${client.userId} against target ${userIds}`);
      if (userIds.includes(client.userId)) {
        try {
          const data = JSON.stringify({
            type: 'notification',
            data: notification
          });
          
          console.log(`   ✅ Sending to client ${client.userId}`);
          client.response.write(`data: ${data}\n\n`);
          sentCount++;
        } catch (error) {
          console.error('❌ Error enviando notificación SSE:', error);
          // Remover cliente si hay error
          clients.delete(client);
        }
      } else {
        console.log(`   ⏭️  Skipping client ${client.userId} (not in target list)`);
      }
    });

    console.log(`📡 SSE: Notificación enviada a ${sentCount}/${userIds.length} clientes conectados`);
    return sentCount;
  },

  /**
   * Obtener número de clientes conectados (para debugging)
   */
  getConnectedClients() {
    return {
      total: clients.size,
      users: Array.from(clients).map(c => c.userId)
    };
  },

  /**
   * Emitir evento a todos los clientes
   */
  broadcastToAll(event: any) {
    clients.forEach(client => {
      try {
        const data = JSON.stringify(event);
        client.response.write(`data: ${data}\n\n`);
      } catch (error) {
        console.error('❌ Error en broadcast:', error);
        clients.delete(client);
      }
    });
  }
};

// Exportar función helper para usar en otros módulos
export const emitNotificationToUsers = notificationSSEController.emitNotification.bind(notificationSSEController);
