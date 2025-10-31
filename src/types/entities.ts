export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  created_at: string;
  updated_at: string | null;
  agent_id: string | null;
}

export interface Agent {
  id: string;
  name: string;
  type: "voice" | "chat";
  status: "active" | "inactive";
  model: string | null;
  voice: string | null;
  system_prompt: string | null;
  assignment_rules: string | null;
  last_updated: string | null;
}




