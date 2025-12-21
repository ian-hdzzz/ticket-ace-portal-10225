#!/bin/bash

# Script para probar el endpoint SSE de notificaciones
# Asegúrate de tener una sesión activa con cookies válidas

echo "🧪 Probando SSE de notificaciones..."
echo "📡 Conectando a http://localhost:8081/api/notifications/stream"
echo ""
echo "⚠️  Necesitas estar autenticado. Copia la cookie de sesión desde el navegador."
echo ""

# Reemplaza 'tu-cookie-aqui' con la cookie de sesión real desde DevTools
# Para obtenerla: DevTools → Application → Cookies → localhost:8081
# Busca la cookie de sesión (ej: connect.sid o similar)

curl -N \
  -H "Accept: text/event-stream" \
  -H "Cookie: connect.sid=tu-cookie-aqui" \
  http://localhost:8081/api/notifications/stream

# Flags:
# -N = No buffer (necesario para SSE)
# -H = Headers personalizados
