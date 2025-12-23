import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { NotificationWidget } from './NotificationWidget';
import { useNotifications } from '@/contexts/NotificationContextSSE';
import { agentService, type AgentStatus } from '@/services/agent.service';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AgentWidgetsProps {
  userId: string;
}

export const AgentWidgets: React.FC<AgentWidgetsProps> = ({ userId }) => {
  const [agentStatus, setAgentStatus] = useState<AgentStatus>('offline');
  const { reconnect, connected } = useNotifications();

  useEffect(() => {
    const fetchAgentStatus = async () => {
      const agent = await agentService.getAgentByUserId(userId);
      if (agent) {
        setAgentStatus(agent.status);
      }
    };
    fetchAgentStatus();
    
    // Trigger notification fetch and SSE connection when agent widgets mount
    reconnect();
  }, [userId, reconnect]);

  const handleStatusChange = async (newStatus: AgentStatus) => {
    const success = await agentService.updateAgentStatus(userId, newStatus);
    if (success) {
      setAgentStatus(newStatus);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      {/* SSE Connection Status - Debug indicator */}
      {!connected && (
        <div className="bg-yellow-50 rounded-full shadow-lg px-3 py-2 border border-yellow-200 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
          <span className="text-xs text-yellow-700">SSE desconectado</span>
        </div>
      )}
      
      {/* Status Dropdown */}
      <div className="bg-white rounded-full shadow-lg px-4 py-2 border border-gray-200">
        <Select value={agentStatus} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[130px] border-0 focus:ring-0 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Activo</span>
              </div>
            </SelectItem>
            <SelectItem value="inactive">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-400" />
                <span>Inactivo</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notification Widget */}
      <NotificationWidget />
    </div>
  );
};

