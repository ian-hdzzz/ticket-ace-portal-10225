#!/bin/bash
# Stop Chatwoot backend services

set -e

cd "$(dirname "$0")/../infra" || exit 1

echo "Stopping Chatwoot services..."
docker compose \
  --env-file .env \
  -f docker-compose.chatwoot.upstream.yaml \
  -f docker-compose.chatwoot.local.yaml \
  down

echo "Chatwoot services stopped."

