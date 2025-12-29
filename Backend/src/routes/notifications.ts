import { Router } from 'express';
import { notificationController } from '../controllers/notificationController.js';
import { notificationSSEController } from '../controllers/notificationSSEController.js';
import { notificationWebhookController } from '../controllers/notificationWebhookController.js';
import { authenticateToken, authenticateSSE } from '../middleware/auth.middleware.js';

const router = Router();

// Webhook endpoint (NO AUTH - called by Supabase)
router.post('/webhook', notificationWebhookController.handleNotificationWebhook);

// SSE Stream endpoint (debe ir primero y usa auth especial para EventSource)
router.get('/stream', authenticateSSE, notificationSSEController.streamNotifications);

// Todas las demás rutas requieren autenticación normal
// router.use(authenticateToken);

// Obtener notificaciones del usuario
router.get('/', notificationController.getUserNotifications);

// Obtener conteo de no leídas
router.get('/unread-count', notificationController.getUnreadCount);

// Marcar notificación como leída
router.patch('/:id/read', notificationController.markAsRead);

// Marcar todas como leídas
router.patch('/read-all', notificationController.markAllAsRead);

// Eliminar notificación
router.delete('/:id', notificationController.deleteNotification);

export default router;
