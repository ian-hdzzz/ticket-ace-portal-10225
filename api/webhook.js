
require('dotenv').config();
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const CHATWOOT_ACCOUNT_ID = process.env.CHATWOOT_ACCOUNT_ID;
const CHATWOOT_AGENT_BOT_TOKEN = process.env.CHATWOOT_AGENT_BOT_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const CHATWOOT_BASE_URL = process.env.CHATWOOT_BASE_URL || 'https://app.chatwoot.com';

const chatwootAPI = axios.create({
  baseURL: `${CHATWOOT_BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}`,
  headers: {
    'Content-Type': 'application/json',
    'api_access_token': CHATWOOT_AGENT_BOT_TOKEN
  }
});

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { message_type, content, conversation } = req.body;

  if (message_type === 'private' || req.body.private) {
    return res.status(200).send();
  }

  if (message_type !== 'incoming') {
    return res.status(200).send();
  }

  try {
    const result = await model.generateContent(content);
    const response = await result.response;
    const geminiResponse = response.text();

    await chatwootAPI.post(`/conversations/${conversation.id}/messages`, {
      content: geminiResponse,
      private: false,
    });

    res.status(200).send();
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).send();
  }
};
