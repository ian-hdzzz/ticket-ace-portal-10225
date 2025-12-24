import { supabase } from '../supabase/client';

export type AgentStatus = 'active' | 'inactive' | 'offline';

export interface Agent {
  id: string;
  chatwoot_user_id: number;
  name: string;
  email: string | null;
  status: AgentStatus;
  status_changed_at: string | null;
  current_load: number;
  max_load: number;
  last_assigned_at: string | null;
  created_at: string;
  user_id: string;
}

class AgentService {
  /**
   * Get agent by user ID
   */
  async getAgentByUserId(userId: string): Promise<Agent | null> {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching agent:', error);
      return null;
    }

    return data;
  }

  /**
   * Update agent status
   */
  async updateAgentStatus(userId: string, status: AgentStatus): Promise<boolean> {
    const { error } = await supabase
      .from('agents')
      .update({
        status,
        status_changed_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating agent status:', error);
      return false;
    }

    return true;
  }

  /**
   * Set agent to active status (on login)
   */
  async setAgentActive(userId: string): Promise<boolean> {
    return this.updateAgentStatus(userId, 'active');
  }

  /**
   * Set agent to inactive status (on logout)
   */
  async setAgentInactive(userId: string): Promise<boolean> {
    return this.updateAgentStatus(userId, 'inactive');
  }
}

export const agentService = new AgentService();
export default agentService;

