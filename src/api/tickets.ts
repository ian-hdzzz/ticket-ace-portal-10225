import { chatwootFetch, type ChatwootConversation } from "@/lib/chatwootClient";
import type { Ticket } from "@/types/entities";

const accountId = import.meta.env.VITE_CHATWOOT_ACCOUNT_ID;

if (!accountId) {
  console.warn("VITE_CHATWOOT_ACCOUNT_ID is not set. Chatwoot API calls will fail.");
}

function mapChatwootConversationToTicket(conv: ChatwootConversation): Ticket {
  return {
    id: String(conv.id),
    title: conv.contact.name || `Conversation ${conv.id}`,
    description: `Conversation with ${conv.contact.name}`,
    status: conv.status === "resolved" ? "resolved" : conv.status === "closed" ? "closed" : conv.status === "pending" ? "open" : "in_progress",
    priority: conv.priority === "urgent" ? "urgent" : conv.priority === "high" ? "high" : conv.priority === "low" ? "low" : "medium",
    created_at: conv.created_at,
    updated_at: conv.updated_at,
    agent_id: conv.meta?.sender?.id ? String(conv.meta.sender.id) : null,
  };
}

export async function listTickets(): Promise<Ticket[]> {
  if (!accountId) throw new Error("Missing VITE_CHATWOOT_ACCOUNT_ID");
  const res = await chatwootFetch(`/accounts/${accountId}/conversations`);
  const convs: ChatwootConversation[] = await res.json();
  return convs.map(mapChatwootConversationToTicket);
}

export async function getTicketById(id: string): Promise<Ticket | null> {
  if (!accountId) throw new Error("Missing VITE_CHATWOOT_ACCOUNT_ID");
  const res = await chatwootFetch(`/accounts/${accountId}/conversations/${id}`);
  const conv: ChatwootConversation = await res.json();
  return mapChatwootConversationToTicket(conv);
}

export async function createTicket(partial: Omit<Ticket, "id" | "created_at" | "updated_at">): Promise<Ticket> {
  if (!accountId) throw new Error("Missing VITE_CHATWOOT_ACCOUNT_ID");
  // Chatwoot creates conversations via inbox + contact
  // For a real implementation, you'd need inbox_id and contact_id
  throw new Error("Creating conversations via API requires inbox and contact setup. Use Chatwoot UI or set up inbox/contact first.");
}

export async function updateTicket(id: string, changes: Partial<Ticket>): Promise<Ticket> {
  if (!accountId) throw new Error("Missing VITE_CHATWOOT_ACCOUNT_ID");
  const payload: Record<string, unknown> = {};
  if (changes.status) payload.status = changes.status;
  if (changes.priority) payload.priority = changes.priority;
  if (changes.agent_id) payload.assignee_id = Number(changes.agent_id);
  const res = await chatwootFetch(`/accounts/${accountId}/conversations/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  const conv: ChatwootConversation = await res.json();
  return mapChatwootConversationToTicket(conv);
}


