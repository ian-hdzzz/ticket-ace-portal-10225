import 'dotenv/config';
import express from 'express';
import axios from 'axios';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.text({ type: ['text/*', 'application/xml', 'text/xml', 'application/soap+xml'] }));
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post('/api/webhook', async (req, res) => {
  const { default: webhookHandler } = await import('./api/webhook.js');
  await webhookHandler(req, res);
});

// Generic SOAP proxy for development. Routes like:
// POST /api/cea/aquacis-com/services/InterfazOficinaVirtualClientesWS
// will be proxied to the configured upstream host in the `upstream` map.
app.post('/api/cea/:proxyName/*', async (req, res) => {
  const { proxyName } = req.params;
  const upstreamMap = {
    'aquacis-cea': 'https://aquacis-cf-int.ceaqueretaro.gob.mx/Comercial',
    'aquacis-com': 'https://ceaqueretaro-cf-int.aquacis.com/Comercial',
    'ceadevws': 'https://appcea.ceaqueretaro.gob.mx',
  };

  const upstream = upstreamMap[proxyName];
  if (!upstream) {
    res.status(400).send({ error: 'Unknown proxy target' });
    return;
  }

  // Compose upstream URL from the path
  const upstreamPath = req.params[0] || '';
  const upstreamUrl = `${upstream}/${upstreamPath}`;

  try {
    const response = await axios.post(upstreamUrl, req.body, {
      headers: {
        'Content-Type': 'text/xml;charset=UTF-8',
        // Some SOAP services require specific SOAPAction headers; pass incoming headers through.
        SOAPAction: req.header('SOAPAction') || '',
      },
      validateStatus: () => true,
    });

    res.status(response.status).send(response.data);
  } catch (err) {
    const message = err?.response?.data || err.message || 'Unknown error';
    res.status(500).send(message);
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Webhook server is running' });
});

app.listen(PORT, () => {
  console.log(`Webhook server listening on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Webhook endpoint: http://localhost:${PORT}/api/webhook`);
});
