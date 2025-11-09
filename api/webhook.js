import 'dotenv/config';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

const CHATWOOT_ACCOUNT_ID = process.env.CHATWOOT_ACCOUNT_ID;
const CHATWOOT_AGENT_BOT_TOKEN = process.env.CHATWOOT_AGENT_BOT_TOKEN;
const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const CHATWOOT_BASE_URL = process.env.CHATWOOT_BASE_URL || 'https://app.chatwoot.com';

console.log('CHATWOOT_ACCOUNT_ID:', CHATWOOT_ACCOUNT_ID ? 'Loaded' : 'Not Loaded');
console.log('CHATWOOT_AGENT_BOT_TOKEN:', CHATWOOT_AGENT_BOT_TOKEN ? 'Loaded' : 'Not Loaded');
console.log('GEMINI_API_KEY:', GEMINI_API_KEY ? 'Loaded' : 'Not Loaded');

const chatwootAPI = axios.create({
  baseURL: `${CHATWOOT_BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}`,
  headers: {
    'Content-Type': 'application/json',
    'api_access_token': CHATWOOT_AGENT_BOT_TOKEN
  }
});

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export default async (req, res) => {
  console.log('Webhook received');
  if (req.method !== 'POST') {
    console.log('Invalid method:', req.method);
    return res.status(405).send('Method Not Allowed');
  }

  const { message_type, content, conversation } = req.body;
  console.log('Message type:', message_type);
  console.log('Content:', content);

  if (message_type === 'private' || req.body.private) {
    console.log('Ignoring private message');
    return res.status(200).send();
  }

  if (message_type !== 'incoming') {
    console.log('Ignoring non-incoming message');
    return res.status(200).send();
  }

  try {
    console.log('Sending message to Gemini...');
    const result = await model.generateContent(content);
    const response = await result.response;
    const geminiResponse = response.text();
    console.log('Received response from Gemini:', geminiResponse);

    console.log('Sending response to Chatwoot...');
    await chatwootAPI.post(`/conversations/${conversation.id}/messages`, {
      content: geminiResponse,
      private: false,
    });
    console.log('Response sent to Chatwoot successfully');

    res.status(200).send();
  } catch (error) {
    console.error('Error processing message:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    console.error('Full error:', error);
    res.status(500).send();
  }
};
