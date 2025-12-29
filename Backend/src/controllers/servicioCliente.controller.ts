import type { Request, Response } from 'express';
import servicioClienteUseCases from '../usecases/servicioCliente.usecases.js';

export const servicioClienteController = {
  /**
   * Get tickets assigned to the current agent (My Tickets)
   * GET /api/servicio-cliente/my-tickets
   */
  async getMyTickets(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const tickets = await servicioClienteUseCases.getMyTickets(userId);

      return res.json({
        success: true,
        data: tickets
      });
    } catch (error: any) {
      console.error('Error getting my tickets:', error);
      
      if (error.message === 'Agente no encontrado') {
        return res.status(404).json({ error: error.message });
      }
      
      return res.status(500).json({ error: 'Error al obtener tickets' });
    }
  },

  /**
   * Get tickets in queue (open, needs agent, not assigned)
   * GET /api/servicio-cliente/queue
   */
  async getQueueTickets(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const tickets = await servicioClienteUseCases.getQueueTickets();

      return res.json({
        success: true,
        data: tickets
      });
    } catch (error: any) {
      console.error('Error getting queue tickets:', error);
      return res.status(500).json({ error: 'Error al obtener cola de tickets' });
    }
  },

  /**
   * Get all open tickets
   * GET /api/servicio-cliente/all-tickets
   */
  async getAllOpenTickets(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const tickets = await servicioClienteUseCases.getAllOpenTickets();

      return res.json({
        success: true,
        data: tickets
      });
    } catch (error: any) {
      console.error('Error getting all open tickets:', error);
      return res.status(500).json({ error: 'Error al obtener todos los tickets' });
    }
  },

  /**
   * Assign a ticket to the current agent
   * POST /api/servicio-cliente/:ticketId/assign
   */
  async assignTicketToAgent(req: Request, res: Response) {
    try {
      const { ticketId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      if (!ticketId) {
        return res.status(400).json({ error: 'ID de ticket no proporcionado' });
      }

      const updatedTicket = await servicioClienteUseCases.assignTicketToAgent(userId, ticketId);

      return res.json({
        success: true,
        ticket: updatedTicket
      });
    } catch (error: any) {
      console.error('Error assigning ticket:', error);
      
      if (error.message === 'Agente no encontrado') {
        return res.status(404).json({ error: error.message });
      }
      
      return res.status(500).json({ 
        error: 'Error al asignar ticket',
        message: error.message 
      });
    }
  }
};
