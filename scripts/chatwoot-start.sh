#!/bin/bash
# Start Chatwoot backend services

set -e

cd "$(dirname "$0")/../infra" || exit 1

echo "Starting Chatwoot services..."
docker compose \
  --env-file .env \
  -f docker-compose.chatwoot.upstream.yaml \
  -f docker-compose.chatwoot.local.yaml \
  up -d postgres redis rails sidekiq

echo "Waiting for Postgres to be ready..."
for i in $(seq 1 30); do
  if docker compose \
    --env-file .env \
    -f docker-compose.chatwoot.upstream.yaml \
    -f docker-compose.chatwoot.local.yaml \
    exec -T postgres pg_isready -U postgres >/dev/null 2>&1; then
    echo "Postgres is ready!"
    break
  fi
  sleep 1
done

echo "Chatwoot is starting..."
echo "Access Chatwoot UI at: http://localhost:3000"
echo ""
echo "View logs: docker compose -f infra/docker-compose.chatwoot.upstream.yaml logs -f"
echo "Stop: ./scripts/chatwoot-stop.sh"

