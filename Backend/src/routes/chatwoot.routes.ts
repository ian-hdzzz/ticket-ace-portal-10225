import { Router } from 'express';
import { chatwootController } from '../controllers/chatwoot.controller.js';

const router = Router();

/**
 * Chatwoot & OpenAI Agent Routes
 */

// Main webhook endpoint - receives events from Chatwoot
router.post('/webhook', chatwootController.handleWebhook);

// Session management endpoints
router.get('/session/:conversationId', chatwootController.getSession);
router.delete('/session/:conversationId', chatwootController.clearSession);

// Test endpoint for development
router.post('/test', chatwootController.testMessage);

export default router;

