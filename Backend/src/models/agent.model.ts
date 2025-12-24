import { prisma } from '../utils/prisma.js';

class AgentModel {
  /**
   * Find agent by user ID
   */
  async findByUserId(userId: string) {
    return await prisma.agent.findUnique({
      where: { userId }
    });
  }

  /**
   * Find agent by ID
   */
  async findById(agentId: string) {
    return await prisma.agent.findUnique({
      where: { id: agentId }
    });
  }
}

export default new AgentModel();

