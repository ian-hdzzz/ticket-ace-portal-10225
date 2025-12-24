#!/bin/bash

# 🧪 Test de Tags - Diferentes formatos
# Para entender qué formato está enviando Supabase

echo "🧪 ================================================"
echo "   TEST DE FORMATOS DE TAGS"
echo "===================================================="
echo ""

BACKEND_URL="http://localhost:3000/api/email/webhook/ticket-created"

# ============================================
# TEST 1: Tags como array (formato correcto)
# ============================================

echo "1️⃣ TEST: Tags como ARRAY ['necesita_agente']"
echo "============================================"

curl -s -X POST "$BACKEND_URL" \
  -H "Content-Type: application/json" \
  -d '{
  "record": {
    "id": "test-1",
    "folio": "TEST-ARRAY-001",
    "titulo": "Test con array",
    "descripcion": "Ticket de prueba",
    "tags": ["necesita_agente"],
    "priority": "high",
    "status": "open",
    "channel": "telefono",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "user_email": "ianhdez2020@gmail.com",
  "user_name": "Test User"
}' | jq .

echo ""
echo ""

# ============================================
# TEST 2: Tags como string simple
# ============================================

echo "2️⃣ TEST: Tags como STRING 'necesita_agente'"
echo "============================================"

curl -s -X POST "$BACKEND_URL" \
  -H "Content-Type: application/json" \
  -d '{
  "record": {
    "id": "test-2",
    "folio": "TEST-STRING-001",
    "titulo": "Test con string",
    "descripcion": "Ticket de prueba",
    "tags": "necesita_agente",
    "priority": "high",
    "status": "open",
    "channel": "telefono",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "user_email": "ianhdez2020@gmail.com",
  "user_name": "Test User"
}' | jq .

echo ""
echo ""

# ============================================
# TEST 3: Tags como array vacío
# ============================================

echo "3️⃣ TEST: Tags como ARRAY VACÍO []"
echo "============================================"

curl -s -X POST "$BACKEND_URL" \
  -H "Content-Type: application/json" \
  -d '{
  "record": {
    "id": "test-3",
    "folio": "TEST-EMPTY-001",
    "titulo": "Test sin tags",
    "descripcion": "Ticket de prueba",
    "tags": [],
    "priority": "high",
    "status": "open",
    "channel": "telefono",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "user_email": "ianhdez2020@gmail.com",
  "user_name": "Test User"
}' | jq .

echo ""
echo ""

# ============================================
# TEST 4: Tags como null
# ============================================

echo "4️⃣ TEST: Tags como NULL"
echo "============================================"

curl -s -X POST "$BACKEND_URL" \
  -H "Content-Type: application/json" \
  -d '{
  "record": {
    "id": "test-4",
    "folio": "TEST-NULL-001",
    "titulo": "Test tags null",
    "descripcion": "Ticket de prueba",
    "tags": null,
    "priority": "high",
    "status": "open",
    "channel": "telefono",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "user_email": "ianhdez2020@gmail.com",
  "user_name": "Test User"
}' | jq .

echo ""
echo ""

# ============================================
# TEST 5: Sin campo tags
# ============================================

echo "5️⃣ TEST: SIN campo tags"
echo "============================================"

curl -s -X POST "$BACKEND_URL" \
  -H "Content-Type: application/json" \
  -d '{
  "record": {
    "id": "test-5",
    "folio": "TEST-NO-FIELD-001",
    "titulo": "Test sin campo tags",
    "descripcion": "Ticket de prueba",
    "priority": "high",
    "status": "open",
    "channel": "telefono",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "user_email": "ianhdez2020@gmail.com",
  "user_name": "Test User"
}' | jq .

echo ""
echo ""

# ============================================
# TEST 6: Tags como texto con formato PostgreSQL
# ============================================

echo "6️⃣ TEST: Tags como STRING '{necesita_agente}' (formato PostgreSQL)"
echo "============================================"

curl -s -X POST "$BACKEND_URL" \
  -H "Content-Type: application/json" \
  -d '{
  "record": {
    "id": "test-6",
    "folio": "TEST-PG-FORMAT-001",
    "titulo": "Test formato PostgreSQL",
    "descripcion": "Ticket de prueba",
    "tags": "{necesita_agente}",
    "priority": "high",
    "status": "open",
    "channel": "telefono",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "user_email": "ianhdez2020@gmail.com",
  "user_name": "Test User"
}' | jq .

echo ""
echo ""

# ============================================
# RESUMEN
# ============================================

echo "===================================================="
echo "🏁 TESTS COMPLETADOS"
echo "===================================================="
echo ""
echo "📋 Revisa los logs del backend para ver:"
echo "   - Cómo llegó cada formato de tags"
echo "   - Cuáles pasaron el filtro"
echo "   - Cuáles fueron rechazados"
echo ""
echo "✅ Los que DEBERÍAN enviar email:"
echo "   - TEST 1 (array): ['necesita_agente'] ✅"
echo "   - TEST 2 (string): 'necesita_agente' ✅"
echo ""
echo "❌ Los que NO deberían enviar:"
echo "   - TEST 3 (array vacío)"
echo "   - TEST 4 (null)"
echo "   - TEST 5 (sin campo)"
echo ""
echo "⚠️  TEST 6 (formato PostgreSQL) depende de cómo PostgreSQL"
echo "   serialice el array en JSON"
echo ""
echo "===================================================="
