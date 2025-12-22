import type { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';

export const notificationController = {
  // Obtener todas las notificaciones del usuario
  async getUserNotifications(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const where: any = { userId };
      if (req.query.unreadOnly === 'true') {
        where.read = false;
      }

      const notifications = await prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 100, // Límite de 100 notificaciones
        include: {
          ticket: {
            select: {
              id: true,
              folio: true,
              titulo: true,
              status: true,
              priority: true,
            },
          },
        },
      });
      // console.log("notifications", notifications);

      // Obtener el conteo de no leídas
      const unreadCount = await prisma.notification.count({
        where: { userId, read: false },
      });

      return res.json({
        notifications,
        unreadCount,
      });
    } catch (error) {
      console.error('Error obteniendo notificaciones:', error);
      return res.status(500).json({ error: 'Error obteniendo notificaciones' });
    }
  },

  // Marcar notificación como leída
  async markAsRead(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      // Verificar que la notificación pertenece al usuario
      const notification = await prisma.notification.findFirst({
        where: { id, userId },
      });

      if (!notification) {
        return res.status(404).json({ error: 'Notificación no encontrada' });
      }

      const updated = await prisma.notification.update({
        where: { id },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      return res.json(updated);
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
      return res.status(500).json({ error: 'Error actualizando notificación' });
    }
  },

  // Marcar todas como leídas
  async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      await prisma.notification.updateMany({
        where: { userId, read: false },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      return res.json({ message: 'Todas las notificaciones marcadas como leídas' });
    } catch (error) {
      console.error('Error marcando todas como leídas:', error);
      return res.status(500).json({ error: 'Error actualizando notificaciones' });
    }
  },

  // Eliminar notificación
  async deleteNotification(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      // Verificar que la notificación pertenece al usuario
      const notification = await prisma.notification.findFirst({
        where: { id, userId },
      });

      if (!notification) {
        return res.status(404).json({ error: 'Notificación no encontrada' });
      }

      await prisma.notification.delete({
        where: { id },
      });

      return res.json({ message: 'Notificación eliminada' });
    } catch (error) {
      console.error('Error eliminando notificación:', error);
      return res.status(500).json({ error: 'Error eliminando notificación' });
    }
  },

  // Crear notificación (usado internamente)
  async createNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    ticketId?: string,
    metadata?: any
  ) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          type: type as any,
          title,
          message,
          ticketId,
          metadata,
        },
      });
      return notification;
    } catch (error) {
      console.error('Error creando notificación:', error);
      throw error;
    }
  },

  // Obtener conteo de no leídas
  async getUnreadCount(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const count = await prisma.notification.count({
        where: { userId, read: false },
      });

      return res.json({ count });
    } catch (error) {
      console.error('Error obteniendo conteo:', error);
      return res.status(500).json({ error: 'Error obteniendo conteo' });
    }
  },
};
