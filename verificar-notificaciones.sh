#!/bin/bash

# 🔍 Script de Verificación del Sistema de Notificaciones
# Este script verifica que todo el sistema esté configurado correctamente

echo "🔍 Verificando Sistema de Notificaciones..."
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contadores
PASSED=0
FAILED=0

# Función para verificar
check() {
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ $1${NC}"
    ((PASSED++))
  else
    echo -e "${RED}❌ $1${NC}"
    ((FAILED++))
  fi
}

# 1. Verificar archivos backend
echo "📁 Verificando archivos backend..."
[ -f "Backend/src/controllers/notificationController.ts" ]
check "notificationController.ts existe"

[ -f "Backend/src/controllers/notificationSSEController.ts" ]
check "notificationSSEController.ts existe"

[ -f "Backend/src/routes/notifications.ts" ]
check "notifications.ts existe"

# 2. Verificar imports correctos
echo ""
echo "🔧 Verificando imports de Prisma..."
grep -q "import { prisma } from '../utils/prisma.js';" Backend/src/controllers/notificationController.ts
check "notificationController usa prisma correcto"

grep -q "import { prisma } from '../utils/prisma.js';" Backend/src/routes/email.ts
check "email.ts usa prisma correcto"

grep -q "emitNotificationToUsers" Backend/src/routes/email.ts
check "email.ts importa emitNotificationToUsers"

# 3. Verificar rutas registradas
echo ""
echo "🛣️  Verificando rutas registradas..."
grep -q "notificationRouter" Backend/src/index.ts
check "notificationRouter importado en index.ts"

grep -q "/api/notifications" Backend/src/index.ts
check "Ruta /api/notifications registrada"

# 4. Verificar archivos frontend
echo ""
echo "📱 Verificando archivos frontend..."
[ -f "Frontend/src/contexts/NotificationContext.tsx" ]
check "NotificationContext.tsx existe"

[ -f "Frontend/src/contexts/NotificationContextSSE.tsx" ]
check "NotificationContextSSE.tsx existe (SSE)"

[ -f "Frontend/src/components/NotificationWidget.tsx" ]
check "NotificationWidget.tsx existe"

[ -f "Frontend/src/pages/Notifications.tsx" ]
check "Notifications.tsx existe"

# 5. Verificar registros en App.tsx
echo ""
echo "⚛️  Verificando App.tsx..."
grep -q "NotificationProvider" Frontend/src/App.tsx
check "NotificationProvider importado"

grep -q "notifications" Frontend/src/App.tsx
check "Ruta /notifications registrada"

# 6. Verificar DashboardLayout
echo ""
echo "🎨 Verificando DashboardLayout..."
grep -q "NotificationWidget" Frontend/src/components/layout/DashboardLayout.tsx
check "NotificationWidget en DashboardLayout"

# 7. Verificar schema.prisma
echo ""
echo "💾 Verificando schema.prisma..."
grep -q "model Notification" Backend/prisma/schema.prisma
check "Modelo Notification existe en schema"

grep -q "enum NotificationType" Backend/prisma/schema.prisma
check "Enum NotificationType existe"

# 8. Verificar .env
echo ""
echo "🔐 Verificando variables de entorno..."
if [ -f "Backend/.env" ]; then
  grep -q "DATABASE_URL" Backend/.env
  check "DATABASE_URL configurada"
  
  grep -q "DIRECT_URL" Backend/.env
  check "DIRECT_URL configurada"
  
  grep -q "RESEND_API_KEY" Backend/.env
  check "RESEND_API_KEY configurada"
else
  echo -e "${RED}❌ Archivo Backend/.env no encontrado${NC}"
  ((FAILED++))
fi

# 9. Verificar node_modules
echo ""
echo "📦 Verificando dependencias..."
[ -d "Backend/node_modules/@prisma/client" ]
check "Prisma Client instalado"

[ -d "Frontend/node_modules" ]
check "Dependencias Frontend instaladas"

# Resumen
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Verificaciones Exitosas: $PASSED${NC}"
if [ $FAILED -gt 0 ]; then
  echo -e "${RED}❌ Verificaciones Fallidas: $FAILED${NC}"
else
  echo -e "${GREEN}🎉 ¡Todo está configurado correctamente!${NC}"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Sugerencias
if [ $FAILED -gt 0 ]; then
  echo "💡 Sugerencias:"
  echo "   1. Ejecuta: cd Backend && npx prisma generate"
  echo "   2. Verifica que los archivos existan en las rutas correctas"
  echo "   3. Revisa los imports en los archivos que fallaron"
  echo ""
fi

# Instrucciones siguientes
echo "📋 Próximos pasos:"
echo "   1. cd Backend && npm run dev"
echo "   2. cd Frontend && npm run dev"
echo "   3. Crear una notificación de prueba en Supabase"
echo "   4. Verificar que aparezca en el frontend"
echo ""

# Exit code
if [ $FAILED -gt 0 ]; then
  exit 1
else
  exit 0
fi
