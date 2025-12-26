import type { Request, Response } from 'express';
import { openAIAgentService } from '../services/openai-agent.service.js';
import type { ChatwootWebhookPayload } from '../types/openai.types.js';
import axios from 'axios';

/**
 * Controller for handling Chatwoot webhooks and OpenAI agent integration
 */
export const chatwootController = {
  /**
   * POST /api/chatwoot/webhook
   * Main webhook endpoint that receives events from Chatwoot
   */
  async handleWebhook(req: Request, res: Response) {
    try {
      const payload: ChatwootWebhookPayload = req.body;
      console.log(payload);
      
      console.log('🔔 Chatwoot webhook received');
      console.log(`   Event: ${payload.event}`);
      console.log(`   Conversation ID: ${payload.id}`);

      // Respond immediately to Chatwoot
      res.status(200).json({ 
        success: true, 
        message: 'Webhook received' 
      });

      // Process the webhook asynchronously
      setImmediate(() => {
        chatwootController.processWebhook(payload).catch(error => {
          console.error('❌ Error processing webhook:', error);
        });
      });

    } catch (error: any) {
      console.error('❌ Error handling Chatwoot webhook:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  /**
   * Process webhook payload and handle different event types
   */
  async processWebhook(payload: any) {
    console.log("inside processWebhook with payload", payload);
    
    // The payload structure from automation events:
    // - event: string (e.g., 'automation_event.message_created')
    // - id: conversation ID
    // - messages: array of messages
    // - meta.sender: sender info
    // - status, inbox_id, etc.
    
    const { event, id: conversationId, messages, meta, status } = payload;

    try {
      // Normalize event name (handle both 'message_created' and 'automation_event.message_created')
      const normalizedEvent = event.replace('automation_event.', '');
      
      switch (normalizedEvent) {
        case 'message_created':
          await chatwootController.handleMessageCreated(payload);
          break;

        case 'conversation_created':
          console.log(`📝 New conversation created: ${conversationId}`);
          break;

        case 'conversation_status_changed':
          console.log(`🔄 Conversation ${conversationId} status changed to: ${status}`);
          if (status === 'resolved') {
            // Clear session when conversation is resolved
            openAIAgentService.clearSession(conversationId);
          }
          break;

        default:
          console.log(`ℹ️  Unhandled event type: ${event}`);
      }
    } catch (error: any) {
      console.error(`❌ Error processing ${event}:`, error);
      throw error;
    }
  },

  /**
   * Handle new message from customer
   */
  async handleMessageCreated(payload: any) {
    try {
      console.log("inside handleMessageCreated with payload", payload);
      
      // Extract data from the automation event payload structure
      const conversationId = payload.id;
      const messages = payload.messages || [];
      const sender = payload.meta?.sender;
      
      // Get the last message from the messages array
      if (messages.length === 0) {
        console.log('   ⏭️  Skipping: No messages in payload');
        return;
      }
      
      const lastMessage = messages[messages.length - 1];

      // Only respond to customer messages (not agent messages)
      // message_type: 0 = incoming (customer), 1 = outgoing (agent)
      if (sender?.type !== 'contact' || lastMessage?.message_type !== 0) {
        console.log('   ⏭️  Skipping: Not a customer message');
        console.log('   Sender type:', sender?.type);
        console.log('   Message type:', lastMessage?.message_type);
        return;
      }

      // Skip if message is empty
      if (!lastMessage?.content || lastMessage.content.trim() === '') {
        console.log('   ⏭️  Skipping: Empty message');
        return;
      }

      console.log(`📨 Processing customer message`);
      console.log(`   Conversation: ${conversationId}`);
      console.log(`   Message: ${lastMessage.content.substring(0, 100)}...`);

      // Get user ID from sender
      const userId = sender?.id?.toString() || 'anonymous';

      // Send message to OpenAI agent
      const response = await openAIAgentService.sendMessage(
        conversationId,
        lastMessage.content,
        userId
      );

      console.log(`✅ Generated AI response`);
      console.log(`   Response: ${response.content.substring(0, 100)}...`);

      // Send response back to Chatwoot
      await chatwootController.sendMessageToChatwoot(
        conversationId,
        response.content
      );

      console.log(`✅ Message sent to Chatwoot`);

    } catch (error: any) {
      console.error('❌ Error handling message:', error);
      
      // Send error message to Chatwoot
      const conversationId = payload?.id;
      if (conversationId) {
        try {
          await chatwootController.sendMessageToChatwoot(
            conversationId,
            'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta nuevamente o espera a que un agente te atienda.'
          );
        } catch (sendError) {
          console.error('❌ Failed to send error message to Chatwoot:', sendError);
        }
      }
    }
  },

  /**
   * Send message to Chatwoot conversation
   */
  async sendMessageToChatwoot(conversationId: number, content: string) {
    const chatwootUrl = process.env.CHATWOOT_URL;
    const chatwootToken = process.env.CHATWOOT_API_TOKEN;
    const accountId = process.env.CHATWOOT_ACCOUNT_ID;

    if (!chatwootUrl || !chatwootToken || !accountId) {
      throw new Error('Chatwoot configuration missing (CHATWOOT_URL, CHATWOOT_API_TOKEN, CHATWOOT_ACCOUNT_ID)');
    }

    try {
      const url = `${chatwootUrl}/api/v1/accounts/${accountId}/conversations/${conversationId}/messages`;
      
      const response = await axios.post(
        url,
        {
          content: content,
          message_type: 'outgoing',
          private: false,
        },
        {
          headers: {
            'api_access_token': chatwootToken,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ Error sending message to Chatwoot:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * GET /api/chatwoot/session/:conversationId
   * Get session info for a conversation
   */
  async getSession(req: Request, res: Response) {
    try {
      const conversationId = parseInt(req.params.conversationId);
      
      if (isNaN(conversationId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid conversation ID'
        });
      }

      const session = openAIAgentService.getSession(conversationId);
      const history = openAIAgentService.getHistory(conversationId);

      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Session not found'
        });
      }

      res.json({
        success: true,
        data: {
          session,
          messageCount: history.length,
          history: history.slice(-10), // Return last 10 messages
        }
      });

    } catch (error: any) {
      console.error('❌ Error getting session:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * DELETE /api/chatwoot/session/:conversationId
   * Clear session for a conversation
   */
  async clearSession(req: Request, res: Response) {
    try {
      const conversationId = parseInt(req.params.conversationId);
      
      if (isNaN(conversationId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid conversation ID'
        });
      }

      openAIAgentService.clearSession(conversationId);

      res.json({
        success: true,
        message: `Session cleared for conversation ${conversationId}`
      });

    } catch (error: any) {
      console.error('❌ Error clearing session:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * POST /api/chatwoot/test
   * Test endpoint to send a message directly to the AI
   */
  async testMessage(req: Request, res: Response) {
    try {
      const { conversationId, message, userId } = req.body;

      if (!conversationId || !message) {
        return res.status(400).json({
          success: false,
          error: 'conversationId and message are required'
        });
      }

      const response = await openAIAgentService.sendMessage(
        conversationId,
        message,
        userId || 'test-user'
      );

      res.json({
        success: true,
        data: response
      });

    } catch (error: any) {
      console.error('❌ Error testing message:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};

