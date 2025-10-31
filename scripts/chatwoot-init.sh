#!/bin/bash
# Initialize Chatwoot database (run once on first setup)

set -e

cd "$(dirname "$0")/../infra" || exit 1

echo "Initializing Chatwoot database..."
echo "This may take a few minutes..."

docker compose \
  --env-file .env \
  -f docker-compose.chatwoot.upstream.yaml \
  -f docker-compose.chatwoot.local.yaml \
  run --rm rails bundle exec rails db:chatwoot_prepare

echo "Database initialization complete!"
echo "You can now start Chatwoot with: ./scripts/chatwoot-start.sh"

