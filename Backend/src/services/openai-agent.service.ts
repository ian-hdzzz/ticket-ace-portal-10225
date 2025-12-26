import OpenAI from 'openai';
import type { 
  OpenAIAgentSession, 
  OpenAIAgentMessage, 
  OpenAIAgentResponse,
  AgentConfig 
} from '../types/openai.types.js';

/**
 * OpenAI Agent Service
 * Manages communication with OpenAI agents and session management
 */
class OpenAIAgentService {
  private client: OpenAI;
  private sessions: Map<number, OpenAIAgentSession> = new Map();
  private conversationHistory: Map<number, OpenAIAgentMessage[]> = new Map();
  private defaultConfig: AgentConfig;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }

    this.client = new OpenAI({
      apiKey: apiKey,
    });

    this.defaultConfig = {
      workflowId: process.env.OPENAI_WORKFLOW_ID || undefined,
      assistantId: process.env.OPENAI_ASSISTANT_ID || undefined,
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000'),
    };

    console.log('✅ OpenAI Agent Service initialized');
  }

  /**
   * Create or get existing session for a Chatwoot conversation
   */
  async getOrCreateSession(conversationId: number, userId: string): Promise<OpenAIAgentSession> {
    // Check if session already exists
    const existingSession = this.sessions.get(conversationId);
    
    if (existingSession) {
      // Update last activity
      existingSession.lastActivity = new Date();
      return existingSession;
    }

    // Create new session
    const session: OpenAIAgentSession = {
      sessionId: `session_${conversationId}_${Date.now()}`,
      conversationId,
      userId,
      clientSecret: '', // Will be populated if using ChatKit
      createdAt: new Date(),
      lastActivity: new Date(),
    };

    this.sessions.set(conversationId, session);
    this.conversationHistory.set(conversationId, []);

    console.log(`📝 Created new session for conversation ${conversationId}`);
    return session;
  }

  /**
   * Send message to OpenAI agent and get response
   * This uses the Chat Completions API
   */
  async sendMessage(
    conversationId: number,
    userMessage: string,
    userId: string,
    config?: Partial<AgentConfig>
  ): Promise<OpenAIAgentResponse> {
    try {
      // Get or create session
      const session = await this.getOrCreateSession(conversationId, userId);
      
      // Get conversation history
      const history = this.conversationHistory.get(conversationId) || [];
      
      // Add user message to history
      const userMsg: OpenAIAgentMessage = {
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
      };
      history.push(userMsg);

      // Prepare messages for OpenAI
      const messages = this.prepareMessages(history);

      // Merge config with defaults
      const finalConfig = { ...this.defaultConfig, ...config };

      console.log(`🤖 Sending message to OpenAI for conversation ${conversationId}`);
      console.log(`   User message: ${userMessage.substring(0, 100)}...`);

      // Call OpenAI Chat Completions API
      const completion = await this.client.chat.completions.create({
        model: finalConfig.model!,
        messages: messages,
        temperature: finalConfig.temperature ?? 0.7,
        max_tokens: finalConfig.maxTokens ?? 2000,
      });

      const assistantMessage = completion.choices[0]?.message?.content || 'Lo siento, no pude generar una respuesta.';

      // Add assistant response to history
      const assistantMsg: OpenAIAgentMessage = {
        role: 'assistant',
        content: assistantMessage,
        timestamp: new Date(),
      };
      history.push(assistantMsg);

      // Update history (keep last 20 messages to manage context)
      if (history.length > 20) {
        history.splice(0, history.length - 20);
      }
      this.conversationHistory.set(conversationId, history);

      // Update session activity
      session.lastActivity = new Date();

      console.log(`✅ Received response from OpenAI`);
      console.log(`   Response: ${assistantMessage.substring(0, 100)}...`);

      return {
        content: assistantMessage,
        metadata: {
          model: completion.model,
          usage: completion.usage,
          finishReason: completion.choices[0]?.finish_reason,
        },
      };

    } catch (error: any) {
      console.error('❌ Error calling OpenAI API:', error);
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }

  /**
   * Send message using OpenAI Assistant API (if using assistants)
   */
  async sendMessageWithAssistant(
    conversationId: number,
    userMessage: string,
    userId: string
  ): Promise<OpenAIAgentResponse> {
    try {
      const session = await this.getOrCreateSession(conversationId, userId);
      
      if (!this.defaultConfig.assistantId) {
        throw new Error('OPENAI_ASSISTANT_ID not configured');
      }

      console.log(`🤖 Sending message to OpenAI Assistant for conversation ${conversationId}`);

      // Create a thread if not exists (you might want to store thread IDs per conversation)
      const thread = await this.client.beta.threads.create();

      // Add message to thread
      await this.client.beta.threads.messages.create(thread.id, {
        role: 'user',
        content: userMessage,
      });

      // Run the assistant
      const run = await this.client.beta.threads.runs.create(thread.id, {
        assistant_id: this.defaultConfig.assistantId!,
      });

      // Wait for completion (polling)
      let runStatus = await this.client.beta.threads.runs.retrieve(run.id, {
        thread_id: thread.id
      });
      
      while (runStatus.status === 'queued' || runStatus.status === 'in_progress') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        runStatus = await this.client.beta.threads.runs.retrieve(run.id, {
          thread_id: thread.id
        });
      }

      if (runStatus.status !== 'completed') {
        throw new Error(`Assistant run failed with status: ${runStatus.status}`);
      }

      // Get messages
      const messages = await this.client.beta.threads.messages.list(thread.id);
      const lastMessage = messages.data[0];
      
      if (!lastMessage) {
        throw new Error('No message received from assistant');
      }
      
      const content = lastMessage.content[0];
      
      if (!content) {
        throw new Error('No content in message');
      }
      
      const assistantMessage = content.type === 'text' && 'text' in content 
        ? content.text.value 
        : 'No response';

      session.lastActivity = new Date();

      console.log(`✅ Received response from OpenAI Assistant`);

      return {
        content: assistantMessage,
        metadata: {
          threadId: thread.id,
          runId: run.id,
        },
      };

    } catch (error: any) {
      console.error('❌ Error calling OpenAI Assistant API:', error);
      throw new Error(`OpenAI Assistant API error: ${error.message}`);
    }
  }

  /**
   * Prepare messages for OpenAI API with system prompt
   */
  private prepareMessages(history: OpenAIAgentMessage[]): any[] {
    const systemPrompt = process.env.OPENAI_SYSTEM_PROMPT || `Eres un asistente virtual de servicio al cliente para CEA (Comisión Estatal de Agua).
Tu objetivo es ayudar a los clientes con sus consultas sobre servicios de agua, pagos, reportes de fallas, y crear tickets cuando sea necesario.

Instrucciones:
- Sé amable, profesional y conciso
- Si el cliente necesita reportar un problema, ofrece crear un ticket
- Si no tienes información específica, ofrece transferir a un agente humano
- Responde en español de manera clara y directa`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    return messages;
  }

  /**
   * Clear session and history for a conversation
   */
  clearSession(conversationId: number): void {
    this.sessions.delete(conversationId);
    this.conversationHistory.delete(conversationId);
    console.log(`🗑️  Cleared session for conversation ${conversationId}`);
  }

  /**
   * Get session info
   */
  getSession(conversationId: number): OpenAIAgentSession | undefined {
    return this.sessions.get(conversationId);
  }

  /**
   * Get conversation history
   */
  getHistory(conversationId: number): OpenAIAgentMessage[] {
    return this.conversationHistory.get(conversationId) || [];
  }

  /**
   * Clean up old sessions (call periodically)
   */
  cleanupOldSessions(maxAgeMinutes: number = 60): void {
    const now = new Date();
    const sessionsToDelete: number[] = [];

    this.sessions.forEach((session, conversationId) => {
      const ageMinutes = (now.getTime() - session.lastActivity.getTime()) / (1000 * 60);
      if (ageMinutes > maxAgeMinutes) {
        sessionsToDelete.push(conversationId);
      }
    });

    sessionsToDelete.forEach(conversationId => {
      this.clearSession(conversationId);
    });

    if (sessionsToDelete.length > 0) {
      console.log(`🧹 Cleaned up ${sessionsToDelete.length} old sessions`);
    }
  }
}

// Export singleton instance
export const openAIAgentService = new OpenAIAgentService();

