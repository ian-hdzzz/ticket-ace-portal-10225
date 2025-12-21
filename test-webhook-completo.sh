#!/bin/bash

# 🔍 SCRIPT DE DIAGNÓSTICO COMPLETO DEL WEBHOOK Y NOTIFICACIONES
# Este script verifica cada paso del proceso de notificaciones

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 DIAGNÓSTICO COMPLETO - WEBHOOK Y NOTIFICACIONES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# URL del backend (ajusta si es necesario)
BACKEND_URL="http://localhost:3000"

# ============================================
# 1. VERIFICAR QUE EL SERVIDOR ESTÉ CORRIENDO
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  VERIFICANDO SERVIDOR BACKEND"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" ${BACKEND_URL}/health)

if [ "$HEALTH_CHECK" == "200" ]; then
    echo -e "${GREEN}✅ Servidor está corriendo correctamente${NC}"
    echo ""
else
    echo -e "${RED}❌ Servidor NO está corriendo o no responde${NC}"
    echo -e "${YELLOW}   Por favor inicia el backend con: cd Backend && npm run dev${NC}"
    echo ""
    exit 1
fi

# ============================================
# 2. PROBAR ENDPOINT DE WEBHOOK
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  PROBANDO WEBHOOK DE CREACIÓN DE TICKETS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Datos de prueba para el webhook
WEBHOOK_DATA='{
  "record": {
    "id": "test-ticket-'$(date +%s)'",
    "folio": "TKT-TEST-'$(date +%s)'",
    "descripcion": "🧪 PRUEBA: Ticket de prueba para verificar notificaciones",
    "titulo": "Prueba de Notificaciones",
    "priority": "alta",
    "status": "abierto",
    "channel": "app",
    "tags": ["necesita_agente"],
    "created_at": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'"
  },
  "user_email": "ianhdez2020@gmail.com",
  "user_name": "Agente de Prueba",
  "customer_email": "cliente@test.com",
  "customer_name": "Cliente de Prueba"
}'

echo -e "${BLUE}📤 Enviando webhook con estos datos:${NC}"
echo "$WEBHOOK_DATA" | jq '.'
echo ""

WEBHOOK_RESPONSE=$(curl -s -X POST ${BACKEND_URL}/api/email/webhook/ticket-created \
  -H "Content-Type: application/json" \
  -d "$WEBHOOK_DATA")

echo -e "${BLUE}📥 Respuesta del webhook:${NC}"
echo "$WEBHOOK_RESPONSE" | jq '.'
echo ""

# Verificar si el webhook fue exitoso
WEBHOOK_SUCCESS=$(echo "$WEBHOOK_RESPONSE" | jq -r '.success')

if [ "$WEBHOOK_SUCCESS" == "true" ]; then
    echo -e "${GREEN}✅ Webhook ejecutado correctamente${NC}"
    
    # Verificar si se marcó como 'skipped'
    SKIPPED=$(echo "$WEBHOOK_RESPONSE" | jq -r '.skipped // false')
    if [ "$SKIPPED" == "true" ]; then
        echo -e "${YELLOW}⚠️  Webhook procesado pero marcado como 'skipped'${NC}"
        echo -e "${YELLOW}   Esto significa que el ticket no tenía el tag 'necesita_agente'${NC}"
        echo ""
        echo -e "${BLUE}Debug info:${NC}"
        echo "$WEBHOOK_RESPONSE" | jq '.debug'
        echo ""
    fi
else
    echo -e "${RED}❌ Webhook falló${NC}"
    echo -e "${YELLOW}   Revisa los logs del backend para más detalles${NC}"
    echo ""
fi

# ============================================
# 3. VERIFICAR NOTIFICACIONES EN LA BASE DE DATOS
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  VERIFICANDO NOTIFICACIONES EN BASE DE DATOS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${BLUE}📊 Consultando notificaciones...${NC}"
echo ""

# Esperar un momento para que se procese
sleep 2

NOTIFICATIONS=$(curl -s ${BACKEND_URL}/api/notifications)

echo -e "${BLUE}📥 Notificaciones encontradas:${NC}"
echo "$NOTIFICATIONS" | jq '.'
echo ""

# Contar notificaciones
NOTIFICATION_COUNT=$(echo "$NOTIFICATIONS" | jq '.data | length // 0')

if [ "$NOTIFICATION_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Se encontraron $NOTIFICATION_COUNT notificaciones${NC}"
    echo ""
    
    # Mostrar detalles de la última notificación
    echo -e "${BLUE}📋 Última notificación:${NC}"
    echo "$NOTIFICATIONS" | jq '.data[0]'
    echo ""
else
    echo -e "${YELLOW}⚠️  No se encontraron notificaciones${NC}"
    echo -e "${YELLOW}   Posibles causas:${NC}"
    echo -e "${YELLOW}   1. La tabla 'notifications' no existe en la base de datos${NC}"
    echo -e "${YELLOW}   2. No hay usuarios con rol de agente${NC}"
    echo -e "${YELLOW}   3. El ticket no tenía el tag 'necesita_agente'${NC}"
    echo ""
fi

# ============================================
# 4. VERIFICAR CONTADOR DE NO LEÍDAS
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  VERIFICANDO CONTADOR DE NO LEÍDAS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

UNREAD_COUNT=$(curl -s ${BACKEND_URL}/api/notifications/unread-count)

echo -e "${BLUE}📊 Contador de no leídas:${NC}"
echo "$UNREAD_COUNT" | jq '.'
echo ""

UNREAD_NUM=$(echo "$UNREAD_COUNT" | jq -r '.data.count // 0')

if [ "$UNREAD_NUM" -gt 0 ]; then
    echo -e "${GREEN}✅ Hay $UNREAD_NUM notificaciones sin leer${NC}"
else
    echo -e "${YELLOW}⚠️  No hay notificaciones sin leer${NC}"
fi
echo ""

# ============================================
# 5. VERIFICAR LOGS DEL BACKEND
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  INSTRUCCIONES PARA REVISAR LOGS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${BLUE}📋 Para ver los logs del backend en tiempo real:${NC}"
echo -e "${YELLOW}   1. Abre otra terminal${NC}"
echo -e "${YELLOW}   2. Ejecuta: cd Backend && npm run dev${NC}"
echo -e "${YELLOW}   3. Busca mensajes como:${NC}"
echo -e "${YELLOW}      - 🔔 Webhook recibido${NC}"
echo -e "${YELLOW}      - 🔍 === DEBUGGING TAGS ===${NC}"
echo -e "${YELLOW}      - 🔔 Creando notificaciones in-app...${NC}"
echo -e "${YELLOW}      - ✅ X notificaciones creadas${NC}"
echo -e "${YELLOW}      - 📡 SSE: Eventos enviados${NC}"
echo ""

# ============================================
# RESUMEN FINAL
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RESUMEN DEL DIAGNÓSTICO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Estado del sistema:"
echo "├─ Servidor Backend: $([ "$HEALTH_CHECK" == "200" ] && echo -e "${GREEN}✅ OK${NC}" || echo -e "${RED}❌ FAIL${NC}")"
echo "├─ Webhook: $([ "$WEBHOOK_SUCCESS" == "true" ] && echo -e "${GREEN}✅ OK${NC}" || echo -e "${RED}❌ FAIL${NC}")"
echo "├─ Notificaciones en DB: $([ "$NOTIFICATION_COUNT" -gt 0 ] && echo -e "${GREEN}✅ $NOTIFICATION_COUNT encontradas${NC}" || echo -e "${YELLOW}⚠️  0 encontradas${NC}")"
echo "└─ No leídas: $([ "$UNREAD_NUM" -gt 0 ] && echo -e "${GREEN}✅ $UNREAD_NUM${NC}" || echo -e "${YELLOW}⚠️  0${NC}")"
echo ""

# Recomendaciones
echo -e "${BLUE}🔧 PRÓXIMOS PASOS:${NC}"
echo ""

if [ "$NOTIFICATION_COUNT" -eq 0 ]; then
    echo -e "${YELLOW}1. Verifica que la tabla 'notifications' exista:${NC}"
    echo -e "   ${BLUE}Ejecuta el SQL: Backend/prisma/CREAR_TABLA_NOTIFICACIONES.sql${NC}"
    echo ""
    
    echo -e "${YELLOW}2. Verifica que tengas usuarios con rol de agente:${NC}"
    echo -e "   ${BLUE}Ejecuta: cd Backend && npx ts-node -e \"import { prisma } from './src/utils/prisma.js'; prisma.role.findMany({ include: { userRoles: true } }).then(console.log)\"${NC}"
    echo ""
    
    echo -e "${YELLOW}3. Revisa los logs del backend para ver mensajes de error${NC}"
    echo ""
else
    echo -e "${GREEN}✅ El sistema parece estar funcionando correctamente${NC}"
    echo ""
    echo -e "${BLUE}4. Verifica en el frontend:${NC}"
    echo -e "   - El NotificationContext está activo"
    echo -e "   - El NotificationWidget está renderizado"
    echo -e "   - La consola del navegador no muestra errores"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Diagnóstico completado"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
