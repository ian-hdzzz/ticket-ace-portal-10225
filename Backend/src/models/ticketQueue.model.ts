import { prisma } from '../utils/prisma.js';

class TicketQueueModel {
  /**
   * Find all queue items with filters
   */
  async findMany(filters?: { status?: string }) {
    const where: any = {};
    
    if (filters?.status) {
      where.status = filters.status;
    }

    return await prisma.ticketQueue.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { queuedAt: 'asc' }
      ],
      include: {
        ticket: {
          include: {
            customer: {
              select: {
                id: true,
                nombreTitular: true,
                email: true,
                telefono: true
              }
            }
          }
        }
      }
    });
  }

  /**
   * Remove ticket from queue
   */
  async removeByTicketId(ticketId: string) {
    return await prisma.ticketQueue.deleteMany({
      where: { ticketId }
    });
  }
}

export default new TicketQueueModel();

