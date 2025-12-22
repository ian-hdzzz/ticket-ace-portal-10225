import type { Request, Response } from 'express';
import { emitNotificationToUsers } from './notificationSSEController.js';

/**
 * Controller for handling notification webhooks from Supabase
 * This receives notifications created in Supabase and broadcasts them via SSE
 */
export const notificationWebhookController = {
  /**
   * POST /api/notifications/webhook
   * Receives notification from Supabase trigger and broadcasts via SSE
   */
  async handleNotificationWebhook(req: Request, res: Response) {
    try {
      console.log('🔔 Webhook de notificación recibido');
      console.log('📦 Payload:', JSON.stringify(req.body, null, 2));

      const { notification, ticket } = req.body;

      if (!notification) {
        return res.status(400).json({
          success: false,
          error: 'Notification data is required'
        });
      }

      // Determine target users based on ticket assignment
      let targetUserIds: string[] = [];

      if (ticket?.assigned_to) {
        // Assigned to specific agent
        targetUserIds = [ticket.assigned_to];
        console.log(`📤 Notificación para agente específico: ${ticket.assigned_to}`);
      } else {
        // Broadcast to all connected agents (user_id from notification is the agent)
        // In this case, the notification.user_id should be the agent who should receive it
        if (notification.user_id) {
          targetUserIds = [notification.user_id];
          console.log(`📤 Notificación para usuario: ${notification.user_id}`);
        } else {
          console.warn('⚠️  No se especificó user_id ni assigned_to, no se enviará notificación');
          return res.json({
            success: true,
            message: 'Notification received but no target user specified',
            broadcast: false
          });
        }
      }

      // Prepare notification data for SSE broadcast
      const notificationData = {
        id: notification.id,
        userId: notification.user_id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        ticketId: ticket?.id || null,
        read: notification.read || false,
        createdAt: notification.created_at,
        metadata: notification.metadata || {},
        ticket: ticket ? {
          id: ticket.id,
          folio: ticket.folio,
          titulo: ticket.titulo,
          status: ticket.status,
          priority: ticket.priority
        } : null
      };

      // Broadcast via SSE
      const sentCount = emitNotificationToUsers(targetUserIds, notificationData);

      console.log(`✅ Notificación SSE enviada a ${sentCount}/${targetUserIds.length} clientes conectados`);

      res.json({
        success: true,
        message: 'Notification broadcast successful',
        broadcast: {
          targetUsers: targetUserIds.length,
          connectedClients: sentCount,
          notificationId: notification.id
        }
      });

    } catch (error: any) {
      console.error('❌ Error en webhook de notificación:', error);
      
      // Return 200 to prevent Supabase from retrying
      res.status(200).json({
        success: false,
        error: error.message,
        message: 'Error processed, will not retry'
      });
    }
  }
};

