import { chatwootFetch, type ChatwootAgent } from "@/lib/chatwootClient";
import type { Agent } from "@/types/entities";

const accountId = import.meta.env.VITE_CHATWOOT_ACCOUNT_ID;

if (!accountId) {
  console.warn("VITE_CHATWOOT_ACCOUNT_ID is not set. Chatwoot API calls will fail.");
}

function mapChatwootAgentToAgent(cwAgent: ChatwootAgent): Agent {
  return {
    id: String(cwAgent.id),
    name: cwAgent.available_name || cwAgent.name,
    type: "chat", // Chatwoot agents can do both, defaulting to chat
    status: "active", // We'd need to check availability status separately
    model: null,
    voice: null,
    system_prompt: null,
    assignment_rules: null,
    last_updated: null,
  };
}

export async function listAgents(): Promise<Agent[]> {
  if (!accountId) throw new Error("Missing VITE_CHATWOOT_ACCOUNT_ID");
  const res = await chatwootFetch(`/accounts/${accountId}/agents`);
  const cwAgents: ChatwootAgent[] = await res.json();
  return cwAgents.filter(a => a.role === "agent" || a.role === "administrator").map(mapChatwootAgentToAgent);
}

export async function createAgent(partial: Omit<Agent, "id" | "last_updated">): Promise<Agent> {
  // Chatwoot agents are users created via admin API
  // Use Chatwoot UI or admin API to create users/agents
  throw new Error("Creating Chatwoot agents requires user creation via admin API. Use Chatwoot UI or create users first.");
}

export async function updateAgent(id: string, changes: Partial<Agent>): Promise<Agent> {
  if (!accountId) throw new Error("Missing VITE_CHATWOOT_ACCOUNT_ID");
  // Chatwoot user updates via user API
  // For now, fetch and return the existing agent
  // In production, you'd call PUT /accounts/{account_id}/agents/{id} to update
  const res = await chatwootFetch(`/accounts/${accountId}/agents/${id}`);
  const cwAgent: ChatwootAgent = await res.json();
  return mapChatwootAgentToAgent(cwAgent);
}


