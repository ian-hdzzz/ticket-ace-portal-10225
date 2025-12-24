#!/bin/bash

# 🧪 Script de Prueba - Filtrado por Tags
# Prueba que solo se envíen emails a tickets con tag "necesita_agente"

echo "🧪 ================================================"
echo "   PRUEBA DE FILTRADO POR TAGS"
echo "===================================================="
echo ""

BACKEND_URL="http://localhost:3000"
WEBHOOK_URL="${BACKEND_URL}/api/email/webhook/ticket-created"

# Verificar backend
echo "🔍 Verificando backend..."
if ! curl -s "$BACKEND_URL" > /dev/null 2>&1; then
  echo "❌ Backend no está corriendo"
  exit 1
fi
echo "✅ Backend corriendo"
echo ""

# ============================================
# TEST 1: Ticket CON tag "necesita_agente"
# ============================================

echo "📧 TEST 1: Ticket CON tag 'necesita_agente'"
echo "============================================"

PAYLOAD_CON_TAG='{
  "record": {
    "id": "111-con-tag",
    "folio": "TKT-CON-TAG-001",
    "titulo": "Cliente necesita asesor",
    "descripcion": "Problema complejo que requiere atención personalizada",
    "assigned_to": "987fcdeb-51a2-43d7-9012-345678901234",
    "priority": "high",
    "status": "open",
    "channel": "telefono",
    "tags": ["necesita_agente"],
    "created_at": "2024-01-15T10:30:00Z"
  },
  "user_email": "asesor@cea.com",
  "user_name": "Juan Pérez",
  "customer_email": "cliente@example.com",
  "customer_name": "María González"
}'

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD_CON_TAG")

HTTP_BODY=$(echo "$RESPONSE" | sed '$d')
HTTP_STATUS=$(echo "$RESPONSE" | tail -n1)

echo "Status: $HTTP_STATUS"
if [ "$HTTP_STATUS" = "200" ]; then
  if echo "$HTTP_BODY" | grep -q '"skipped":true'; then
    echo "❌ FALLO: Email NO enviado (debería enviarse)"
  else
    echo "✅ ÉXITO: Email enviado correctamente"
  fi
else
  echo "❌ ERROR: $HTTP_BODY"
fi
echo ""

# ============================================
# TEST 2: Ticket SIN tag "necesita_agente"
# ============================================

echo "🚫 TEST 2: Ticket SIN tag 'necesita_agente'"
echo "============================================"

PAYLOAD_SIN_TAG='{
  "record": {
    "id": "222-sin-tag",
    "folio": "TKT-SIN-TAG-001",
    "titulo": "Consulta general",
    "descripcion": "Pregunta simple que no requiere email",
    "assigned_to": "987fcdeb-51a2-43d7-9012-345678901234",
    "priority": "low",
    "status": "open",
    "channel": "app",
    "tags": [],
    "created_at": "2024-01-15T10:35:00Z"
  },
  "user_email": "asesor@cea.com",
  "user_name": "Juan Pérez"
}'

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD_SIN_TAG")

HTTP_BODY=$(echo "$RESPONSE" | sed '$d')
HTTP_STATUS=$(echo "$RESPONSE" | tail -n1)

echo "Status: $HTTP_STATUS"
if [ "$HTTP_STATUS" = "200" ]; then
  if echo "$HTTP_BODY" | grep -q '"skipped":true'; then
    echo "✅ ÉXITO: Email NO enviado (correcto, sin tag)"
  else
    echo "❌ FALLO: Email enviado (no debería enviarse)"
  fi
else
  echo "❌ ERROR: $HTTP_BODY"
fi
echo ""

# ============================================
# TEST 3: Ticket con OTROS tags
# ============================================

echo "🏷️  TEST 3: Ticket con otros tags (sin 'necesita_agente')"
echo "============================================"

PAYLOAD_OTROS_TAGS='{
  "record": {
    "id": "333-otros-tags",
    "folio": "TKT-OTROS-TAGS-001",
    "titulo": "Ticket urgente",
    "descripcion": "Urgente pero no necesita asesor",
    "assigned_to": "987fcdeb-51a2-43d7-9012-345678901234",
    "priority": "high",
    "status": "open",
    "channel": "web",
    "tags": ["urgente", "vip"],
    "created_at": "2024-01-15T10:40:00Z"
  },
  "user_email": "asesor@cea.com",
  "user_name": "Juan Pérez"
}'

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD_OTROS_TAGS")

HTTP_BODY=$(echo "$RESPONSE" | sed '$d')
HTTP_STATUS=$(echo "$RESPONSE" | tail -n1)

echo "Status: $HTTP_STATUS"
if [ "$HTTP_STATUS" = "200" ]; then
  if echo "$HTTP_BODY" | grep -q '"skipped":true'; then
    echo "✅ ÉXITO: Email NO enviado (sin tag 'necesita_agente')"
  else
    echo "❌ FALLO: Email enviado (no debería enviarse)"
  fi
else
  echo "❌ ERROR: $HTTP_BODY"
fi
echo ""

# ============================================
# TEST 4: Ticket con MÚLTIPLES tags incluyendo "necesita_agente"
# ============================================

echo "🏷️🏷️ TEST 4: Ticket con múltiples tags (incluye 'necesita_agente')"
echo "============================================"

PAYLOAD_MULTI_TAGS='{
  "record": {
    "id": "444-multi-tags",
    "folio": "TKT-MULTI-TAGS-001",
    "titulo": "VIP necesita asesor urgente",
    "descripcion": "Cliente VIP con problema urgente",
    "assigned_to": "987fcdeb-51a2-43d7-9012-345678901234",
    "priority": "urgent",
    "status": "open",
    "channel": "telefono",
    "tags": ["necesita_agente", "urgente", "vip"],
    "created_at": "2024-01-15T10:45:00Z"
  },
  "user_email": "asesor@cea.com",
  "user_name": "Juan Pérez",
  "customer_email": "vip@example.com",
  "customer_name": "Cliente VIP"
}'

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD_MULTI_TAGS")

HTTP_BODY=$(echo "$RESPONSE" | sed '$d')
HTTP_STATUS=$(echo "$RESPONSE" | tail -n1)

echo "Status: $HTTP_STATUS"
if [ "$HTTP_STATUS" = "200" ]; then
  if echo "$HTTP_BODY" | grep -q '"skipped":true'; then
    echo "❌ FALLO: Email NO enviado (debería enviarse)"
  else
    echo "✅ ÉXITO: Email enviado (tiene 'necesita_agente' entre otros tags)"
  fi
else
  echo "❌ ERROR: $HTTP_BODY"
fi
echo ""

# ============================================
# RESUMEN
# ============================================

echo "===================================================="
echo "🏁 PRUEBAS COMPLETADAS"
echo "===================================================="
echo ""
echo "✅ Solo los tickets con tag 'necesita_agente' deben enviar email"
echo "📧 Revisa tu bandeja: ianhdez2020@gmail.com"
echo ""
echo "Deberías haber recibido 2 emails:"
echo "  1. TKT-CON-TAG-001 (solo tag necesita_agente)"
echo "  2. TKT-MULTI-TAGS-001 (múltiples tags incluyendo necesita_agente)"
echo ""
echo "===================================================="
