import agentModel from '../models/agent.model.js';
import ticketModel from '../models/ticket.model.js';
import { prisma } from '../utils/prisma.js';

class ServicioClienteUseCases {
  /**
   * Get tickets assigned to the agent (My Tickets)
   */
  async getMyTickets(userId: string) {
    const agent = await agentModel.findByUserId(userId);
    
    if (!agent) {
      throw new Error('Agente no encontrado');
    }

    return await ticketModel.getMyTickets(agent.id);
  }

  /**
   * Get tickets in queue
   */
  async getQueueTickets() {
    return await ticketModel.getQueueTickets();
  }

  /**
   * Get all open tickets
   */
  async getAllOpenTickets() {
    return await ticketModel.getAllOpenTickets();
  }

  /**
   * Assign a ticket to an agent
   */
  async assignTicketToAgent(userId: string, ticketId: string) {
    const agent = await agentModel.findByUserId(userId);
    
    if (!agent) {
      throw new Error('Agente no encontrado');
    }

    // Assign ticket to agent
    const updatedTicket = await ticketModel.assignToAgent(ticketId, agent.id);

    // Remove from ticket_queue if it exists
    await prisma.ticketQueue.deleteMany({
      where: { ticketId }
    });

    return updatedTicket;
  }
}

export default new ServicioClienteUseCases();

