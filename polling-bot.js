import 'dotenv/config';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

const CHATWOOT_ACCOUNT_ID = process.env.CHATWOOT_ACCOUNT_ID;
const CHATWOOT_AGENT_BOT_TOKEN = process.env.CHATWOOT_AGENT_BOT_TOKEN;
const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
const CHATWOOT_BASE_URL = process.env.CHATWOOT_BASE_URL || 'https://app.chatwoot.com';
const POLL_INTERVAL = 5000; // Check every 5 seconds

console.log('🤖 Starting Chatwoot AI Bot (Polling Mode)');
console.log('CHATWOOT_ACCOUNT_ID:', CHATWOOT_ACCOUNT_ID ? '✓' : '✗');
console.log('CHATWOOT_AGENT_BOT_TOKEN:', CHATWOOT_AGENT_BOT_TOKEN ? '✓' : '✗');
console.log('GEMINI_API_KEY:', GEMINI_API_KEY ? '✓' : '✗');
console.log('Polling interval:', POLL_INTERVAL, 'ms\n');

const chatwootAPI = axios.create({
  baseURL: `${CHATWOOT_BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}`,
  headers: {
    'Content-Type': 'application/json',
    'api_access_token': CHATWOOT_AGENT_BOT_TOKEN
  }
});

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// System prompt focused on ticket creation for CEA Querétaro
const SYSTEM_PROMPT = `
Eres un agente de tickets de la CEA Querétaro. Tu función principal es ayudar a crear tickets claros y completos.
Recopila SOLO los datos mínimos necesarios: nombre del solicitante, medio de contacto, ubicación/área, breve descripción,
impacto (a cuántas personas/servicios afecta) y urgencia (inmediata, alta, normal, baja). Si falta un dato clave, haz
una sola pregunta breve y opcionalmente da ejemplos. No inventes información, no prometas tiempos de solución.

Al responder, si hay suficiente información, genera un borrador estructurado:
- Título breve del ticket
- Descripción clara (incluye datos aportados)
- Categoría sugerida
- Prioridad sugerida (basada en impacto + urgencia)
- Pregunta faltante si aún falta un dato esencial

Si el usuario hace preguntas generales que no son para crear ticket, orienta de forma breve y sugiere abrir ticket si corresponde.
Mantén tono institucional, respetuoso y conciso.
`;

// Track which messages we've already responded to (per runtime)
const respondedMessages = new Set();
// Track messages currently being processed to prevent duplicate replies during overlapping polls
const inFlightMessages = new Set();

async function getOpenConversations() {
  try {
    const response = await chatwootAPI.get('/conversations', {
      params: { status: 'open' }
    });
    return response.data.data.payload || [];
  } catch (error) {
    console.error('Error fetching conversations:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return [];
  }
}

async function getConversationMessages(conversationId) {
  try {
    const response = await chatwootAPI.get(`/conversations/${conversationId}/messages`);
    return response.data.payload || [];
  } catch (error) {
    console.error(`Error fetching messages for conversation ${conversationId}:`, error.message);
    return [];
  }
}

async function sendMessage(conversationId, content) {
  try {
    await chatwootAPI.post(`/conversations/${conversationId}/messages`, {
      content: content,
      private: false,
      message_type: 'outgoing'
    });
    console.log(`✓ Sent reply to conversation ${conversationId}`);
  } catch (error) {
    console.error(`✗ Error sending message to conversation ${conversationId}:`, error.message);
  }
}

async function processConversation(conversation) {
  const conversationId = conversation.id;
  
  // Messages are already included in the conversation object
  const messages = conversation.messages || [];
  
  if (messages.length === 0) return;
  
  // Get the most recent customer message (message_type: 0 = incoming)
  const customerMessages = messages.filter(msg => msg.message_type === 0);
  if (customerMessages.length === 0) return;
  
  const lastCustomerMessage = customerMessages[customerMessages.length - 1];
  const messageId = lastCustomerMessage.id;
  
  // Skip if message is already being processed or already responded
  if (inFlightMessages.has(messageId) || respondedMessages.has(messageId)) return;
  
  // Check if we've already replied after this message
  const hasAnyReplyAfter = messages.some(
    (m) => m.message_type === 1 && m.created_at >= lastCustomerMessage.created_at
  );
  if (hasAnyReplyAfter) {
    respondedMessages.add(messageId);
    return;
  }
  
  console.log(`\n📨 New message in conversation ${conversationId}:`);
  console.log(`   Customer: ${lastCustomerMessage.content}`);
  
  try {
    // Mark as in-flight to prevent overlapping polls from duplicating the reply
    inFlightMessages.add(messageId);

    // Generate AI response
    console.log('   🤔 Thinking...');
  const result = await model.generateContent(`${SYSTEM_PROMPT}\n\nMensaje del usuario: ${lastCustomerMessage.content}\n\nGenera tu respuesta siguiendo las instrucciones del sistema.`);
    const response = await result.response;
    const aiResponse = response.text();
    
    console.log(`   🤖 AI Response: ${aiResponse.substring(0, 100)}...`);
    
    // Send the response
    await sendMessage(conversationId, aiResponse);
    
    // Mark this message as responded
    respondedMessages.add(messageId);
    
  } catch (error) {
    console.error('   ✗ Error processing message:', error.message);
    // Allow retry on next poll if send/generation failed
    respondedMessages.delete(messageId);
  } finally {
    inFlightMessages.delete(messageId);
  }
}

async function pollConversations() {
  const conversations = await getOpenConversations();
  
  if (conversations.length > 0) {
    console.log(`\n🔍 Checking ${conversations.length} open conversation(s)...`);
    
    for (const conversation of conversations) {
      await processConversation(conversation);
    }
  }
}

// Start polling
console.log('🚀 Bot is now active and monitoring conversations...\n');
setInterval(pollConversations, POLL_INTERVAL);

// Run immediately on start
pollConversations();
