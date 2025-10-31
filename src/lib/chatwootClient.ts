const baseUrl = (import.meta.env.VITE_CHATWOOT_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const accessToken = import.meta.env.VITE_CHATWOOT_ACCESS_TOKEN;
const accountId = import.meta.env.VITE_CHATWOOT_ACCOUNT_ID;

export function getChatwootHeaders(): HeadersInit {
  if (!accessToken) {
    throw new Error("Missing VITE_CHATWOOT_ACCESS_TOKEN");
  }
  return {
    "Content-Type": "application/json",
    api_access_token: accessToken,
  };
}

export async function chatwootFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const url = `${baseUrl}/api/v1${endpoint}`;
  const headers = { ...getChatwootHeaders(), ...options.headers };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Chatwoot API error: ${res.status} ${body}`);
  }
  return res;
}

export interface ChatwootConversation {
  id: number;
  inbox_id: number;
  status: string;
  created_at: string;
  updated_at: string;
  priority: string;
  unread_count: number;
  last_activity_at: string;
  contact: {
    id: number;
    name: string;
    email?: string;
  };
  meta?: {
    sender?: {
      id?: number;
      name?: string;
    };
  };
}

export interface ChatwootMessage {
  id: number;
  content: string;
  message_type: number;
  created_at: string;
  inbox_id: number;
  conversation_id: number;
}

export interface ChatwootAgent {
  id: number;
  name: string;
  email: string;
  role: string;
  available_name?: string;
}



