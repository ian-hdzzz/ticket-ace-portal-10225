import { Router } from 'express';
import { notificationController } from '../controllers/notificationController.js';
import { notificationSSEController } from '../controllers/notificationSSEController.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// SSE Stream endpoint (debe ir primero para no interferir con otras rutas)
router.get('/stream', notificationSSEController.streamNotifications);

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
