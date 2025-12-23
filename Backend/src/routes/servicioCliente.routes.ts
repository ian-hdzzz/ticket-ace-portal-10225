import { Router } from 'express';
import { servicioClienteController } from '../controllers/servicioCliente.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// Get my tickets (assigned to current agent)
router.get('/my-tickets', authenticateToken, servicioClienteController.getMyTickets);

// Get queue tickets (open, needs agent, not assigned)
router.get('/queue', authenticateToken, servicioClienteController.getQueueTickets);

// Get all open tickets
router.get('/all-tickets', authenticateToken, servicioClienteController.getAllOpenTickets);

// Assign ticket to current agent
router.post('/:ticketId/assign', authenticateToken, servicioClienteController.assignTicketToAgent);

export default router;
