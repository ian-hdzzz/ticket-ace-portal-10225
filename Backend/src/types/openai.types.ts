/**
 * Types for OpenAI Agent Integration
 */

export interface ChatwootMessage {
  id: number;
  content: string;
  message_type: number; // 0 = incoming (customer), 1 = outgoing (agent)
  created_at: string;
  conversation_id: number;
  sender?: {
    id: number;
    name: string;
    email?: string;
  };
}

export interface ChatwootConversation {
  id: number;
  account_id: number;
  inbox_id: number;
  status: string; // 'open', 'resolved', 'pending'
  messages: ChatwootMessage[];
  contact?: {
    id: number;
    name: string;
    email?: string;
    phone_number?: string;
  };
}

export interface ChatwootWebhookPayload {
  event: string; // 'message_created', 'conversation_created', etc.
  account: {
    id: number;
    name: string;
  };
  conversation: ChatwootConversation;
  message?: ChatwootMessage;
  sender?: {
    id: number;
    name: string;
    type: string; // 'contact', 'user'
  };
  id: number;
}

export interface OpenAIAgentSession {
  sessionId: string;
  conversationId: number;
  userId: string;
  clientSecret: string;
  createdAt: Date;
  lastActivity: Date;
}

export interface OpenAIAgentMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface OpenAIAgentResponse {
  content: string;
  toolCalls?: any[];
  metadata?: Record<string, any>;
}

export interface AgentConfig {
  workflowId?: string | undefined;
  assistantId?: string | undefined;
  model?: string | undefined;
  temperature?: number | undefined;
  maxTokens?: number | undefined;
}

