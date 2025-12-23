import { prisma } from '../utils/prisma.js';

class TicketModel {
  /**
   * Get tickets assigned to a specific agent with a specific tag
   */
  async getMyTickets(agentId: string) {
    return await prisma.ticket.findMany({
      where: {
        assignedTo: agentId,
        tags: {
          has: 'necesita_agente'
        },
        status: {
          in: ['abierto', 'en_proceso', 'esperando_cliente']
        }
      },
      include: {
        customer: {
          select: {
            nombreTitular: true,
            numeroContrato: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  /**
   * Get tickets from the queue (unassigned, open, needs agent)
   */
  async getQueueTickets() {
    return await prisma.ticket.findMany({
      where: {
        status: 'abierto',
        assignedTo: null,
        tags: {
          has: 'necesita_agente'
        }
      },
      include: {
        customer: {
          select: {
            nombreTitular: true,
            numeroContrato: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  /**
   * Get all open tickets
   */
  async getAllOpenTickets() {
    return await prisma.ticket.findMany({
      where: {
        status: {
          in: ['abierto', 'en_proceso', 'esperando_cliente']
        }
      },
      include: {
        customer: {
          select: {
            nombreTitular: true,
            numeroContrato: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  /**
   * Assign ticket to agent
   */
  async assignToAgent(ticketId: string, agentId: string) {
    return await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        assignedTo: agentId,
        assignedAt: new Date()
      }
    });
  }

  /**
   * Update ticket
   */
  async update(ticketId: string, data: any) {
    return await prisma.ticket.update({
      where: { id: ticketId },
      data
    });
  }
}

export default new TicketModel();

