# Cloud Run Deployment Guide

This guide covers deploying the Ticket Ace Portal (Frontend + Backend) to Google Cloud Run with Chatwoot reverse proxy integration.

## Prerequisites

- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) installed and authenticated
- A GCP project with billing enabled
- Cloud Build and Cloud Run APIs enabled
- Secrets configured in Secret Manager

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     CLOUD RUN                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Frontend Service (nginx)                                    │
│  └── Serves static files + reverse proxy                    │
│      ├── /app/*      → Chatwoot Cloud Run                   │
│      ├── /auth/*     → Chatwoot Cloud Run                   │
│      ├── /api/v1/*   → Chatwoot Cloud Run                   │
│      ├── /cable      → Chatwoot WebSocket                   │
│      └── /*          → Static SPA files                     │
│                                                              │
│  Backend Service (Node.js)                                   │
│  └── Your API server                                         │
│                                                              │
│  Chatwoot Service (Ruby on Rails)                           │
│  └── Customer support platform                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Step 1: Configure Secrets

Before deploying, ensure all secrets are in Secret Manager. Run the provided script:

```bash
chmod +x deploy-secrets.sh
./deploy-secrets.sh
```

Or manually create secrets:

```bash
# Backend secrets
gcloud secrets create DATABASE_URL --data-file=-
gcloud secrets create JWT_SECRET --data-file=-
gcloud secrets create SESSION_SECRET --data-file=-
gcloud secrets create OPENAI_API_KEY --data-file=-

# Frontend secrets (Vite build args)
gcloud secrets create VITE_SUPABASE_URL --data-file=-
gcloud secrets create VITE_SUPABASE_ANON_KEY --data-file=-
gcloud secrets create VITE_API_URL --data-file=-
# ... add other VITE_* secrets as needed
```

## Step 2: Deploy with Cloud Build

The `cloudbuild.yaml` handles building and deploying both services:

```bash
gcloud builds submit --config=cloudbuild.yaml
```

This will:
1. Build the Frontend Docker image (with nginx + Chatwoot proxy)
2. Build the Backend Docker image
3. Deploy both to Cloud Run

## Step 3: Verify Deployment

After deployment, get your service URLs:

```bash
# Frontend URL
gcloud run services describe ticket-ace-frontend --region=us-central1 --format='value(status.url)'

# Backend URL
gcloud run services describe ticket-ace-backend --region=us-central1 --format='value(status.url)'
```

## Chatwoot Reverse Proxy

The Frontend service includes nginx configuration that proxies Chatwoot routes:

| Path | Destination | Purpose |
|------|-------------|---------|
| `/app/*` | Chatwoot | Main dashboard |
| `/auth/*` | Chatwoot | Authentication |
| `/api/v1/*` | Chatwoot | API + WebSockets |
| `/api/v2/*` | Chatwoot | API v2 |
| `/api/v3/*` | Chatwoot | API v3 |
| `/cable` | Chatwoot | WebSocket (ActionCable) |
| `/vite/assets/*` | Chatwoot | JS/CSS bundles |
| `/packs/*` | Chatwoot | Legacy assets |
| `/chatwoot/*` | Chatwoot | Alternative entry (strips prefix) |

### Accessing Chatwoot

Once deployed, access Chatwoot via your Frontend URL:

```
https://your-frontend-url.run.app/app/login
```

Cookies will be set on your domain (first-party), avoiding third-party cookie issues.

## Configuration Files

### Frontend Dockerfile

Located at `Frontend/dockerfile`. Key features:
- Multi-stage build (Node.js → nginx)
- nginx configured for SPA routing + Chatwoot proxy
- Listens on port 8080 (Cloud Run requirement)

### Cloud Build Config

Located at `cloudbuild.yaml`. Stages:
1. Build Frontend with Vite environment variables
2. Build Backend
3. Deploy both services to Cloud Run with secrets

## Updating Chatwoot URL

If your Chatwoot instance URL changes, update it in:

1. **Production**: `Frontend/dockerfile` (nginx config section)
2. **Local dev**: `Frontend/vite.config.ts` (proxy targets)

Current Chatwoot URL: `https://chatwoot-cea-w2yvjfitdq-uc.a.run.app`

## Troubleshooting

### Login Issues
- Ensure `/auth/*` proxy is working
- Check browser cookies are being set correctly
- Verify Chatwoot's `FRONTEND_URL` env var matches your domain

### WebSocket Disconnections
- The `/cable` route must have WebSocket headers configured
- Cloud Run has a 60-minute timeout for WebSocket connections

### 404 Errors on Assets
- Ensure `/vite/assets/` and `/packs/` proxies are configured
- Check nginx resolver is working (uses Google DNS 8.8.8.8)

### View Logs

```bash
# Frontend logs
gcloud run services logs read ticket-ace-frontend --region=us-central1

# Backend logs
gcloud run services logs read ticket-ace-backend --region=us-central1
```

## Local Development

For local development with Chatwoot proxy, see `Frontend/vite.config.ts`. The Vite dev server proxies the same routes to the Cloud Run Chatwoot instance.

```bash
cd Frontend
npm run dev
# Access Chatwoot at http://localhost:8080/app/login
```
