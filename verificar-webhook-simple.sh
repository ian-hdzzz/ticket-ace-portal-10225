#!/bin/bash

# Script simple para verificar el webhook

echo "🧪 PRUEBA SIMPLE DEL WEBHOOK"
echo ""

# Crear ticket de prueba con tag necesita_agente
echo "📤 Enviando ticket de prueba..."
echo ""

curl -X POST http://localhost:3000/api/email/webhook/ticket-created \
  -H "Content-Type: application/json" \
  -d '{
    "record": {
      "id": "test-123",
      "folio": "TKT-TEST-001",
      "descripcion": "Prueba de notificación",
      "titulo": "Test",
      "priority": "alta",
      "status": "abierto",
      "channel": "app",
      "tags": ["necesita_agente"],
      "created_at": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'"
    },
    "user_email": "ianhdez2020@gmail.com",
    "user_name": "Agente Test",
    "customer_email": "cliente@test.com",
    "customer_name": "Cliente Test"
  }' | jq '.'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔍 Ahora revisa:"
echo "  1. Los logs del backend (terminal donde corre npm run dev)"
echo "  2. Busca mensajes como:"
echo "     - 🔔 Webhook recibido"
echo "     - 🔍 === DEBUGGING TAGS ==="
echo "     - ✅ needsAgent final: true"
echo "     - 🔔 Creando notificaciones in-app..."
echo "     - ✅ X notificaciones creadas"
echo ""
