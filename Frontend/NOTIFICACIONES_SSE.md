# 🔔 Sistema de Notificaciones - Configuración

Este proyecto tiene **DOS sistemas de notificaciones** configurados y listos para usar:

## 📋 Sistemas Disponibles

### 1. **NotificationContext** (Polling)
- ✅ Usa **polling** cada 30 segundos
- ✅ Más simple y estable
- ✅ Compatible con cualquier servidor
- ⚠️ Mayor consumo de recursos (hace peticiones periódicas)
- 📁 Archivo: `src/contexts/NotificationContext.tsx`

### 2. **NotificationContextSSE** (Actualmente Activo ✅)
- ✅ Usa **Server-Sent Events (SSE)** para tiempo real
- ✅ Notificaciones instantáneas
- ✅ Menor consumo de recursos (conexión persistente)
- ⚠️ Requiere configuración específica del servidor
- 📁 Archivo: `src/contexts/NotificationContextSSE.tsx`

---

## 🚀 SSE ACTIVADO - Configuración Actual

### ✅ Cambios Realizados:

1. **App.tsx** → Usando `NotificationContextSSE`
2. **NotificationWidget.tsx** → Usando `NotificationContextSSE`
3. **Notifications.tsx** → Usando `NotificationContextSSE`
4. **vite.config.ts** → Proxy configurado para puerto `8081`

### 📡 Cómo Funciona:

Al iniciar la app:
1. El contexto hace un fetch inicial de notificaciones
2. Abre una conexión SSE a `/api/notifications/stream`
3. El servidor mantiene la conexión abierta
4. Cuando hay nuevas notificaciones, el servidor las envía automáticamente
5. El frontend las recibe en tiempo real sin hacer polling

---

## 🔍 Debugging - Logs en Consola

Cuando el SSE esté funcionando correctamente, verás estos logs:

### ✅ Frontend (Consola del Navegador):
```
🔄 [SSE] Fetching notifications...
📥 [SSE] Response status: 200
✅ [SSE] Notifications received: { count: 1, unread: 0, data: {...} }
🔌 Conectando a SSE...
✅ SSE conectado
📡 SSE: Conexión confirmada
```

### ✅ Backend (Terminal):
```
✅ SSE: Cliente conectado (userId: xxx). Total clientes: 1
```

### ❌ Si hay errores:

**Error 401 en SSE:**
```
❌ [SSE] Error fetching notifications: 401 Unauthorized
```
→ **Solución**: Necesitas estar autenticado. Inicia sesión primero.

**Error de conexión:**
```
EventSource's response has a MIME type ("application/json") that is not "text/event-stream"
```
→ **Solución**: El endpoint SSE no está configurado correctamente en el backend.

**No se conecta SSE:**
```
🔌 Conectando a SSE...
(sin más mensajes)
```
→ **Solución**: Verifica que el backend esté corriendo en puerto 8081.

---

## 🔄 Cómo Cambiar Entre Sistemas

### Para Activar SSE (Tiempo Real):

**1. Editar `Frontend/src/App.tsx`:**

```typescript
// Comentar esta línea:
// import { NotificationProvider } from "./contexts/NotificationContext";

// Descomentar esta línea:
import { NotificationProvider } from "./contexts/NotificationContextSSE";
```

**2. Editar `Frontend/src/components/NotificationWidget.tsx`:**

```typescript
// Cambiar el import de:
import { useNotifications } from '@/contexts/NotificationContext';

// A:
import { useNotifications } from '@/contexts/NotificationContextSSE';
```

**3. Editar `Frontend/src/pages/Notifications.tsx`:**

```typescript
// Cambiar el import de:
import { useNotifications } from '@/contexts/NotificationContext';

// A:
import { useNotifications } from '@/contexts/NotificationContextSSE';
```

**4. Reiniciar el servidor de desarrollo del Frontend**

---

### Para Volver a Polling (Sistema Normal):

Hacer el proceso inverso, cambiando los imports de `NotificationContextSSE` a `NotificationContext`.

---

## ⚙️ Configuración Actual

### Backend (ambos sistemas soportados):
- ✅ Ruta polling: `GET /api/notifications`
- ✅ Ruta SSE: `GET /api/notifications/stream`
- ✅ Controlador SSE: `src/controllers/notificationSSEController.ts`

### Frontend:
- ✅ Proxy configurado en `vite.config.ts` para `/api` → `http://localhost:3000`
- ✅ Proxy configurado en `vite.config.ts` para `/auth` → `http://localhost:3000`
- 🔵 **Sistema Activo**: NotificationContext (Polling)

---

## 🐛 Troubleshooting

### Si las notificaciones no aparecen:

1. **Verificar que el backend esté corriendo** en `http://localhost:3000`
2. **Verificar que el frontend esté corriendo** en `http://localhost:8080`
3. **Abrir DevTools** (F12) → Consola y buscar:
   - Errores 401 (autenticación)
   - Errores de CORS
   - Logs de `📥 Fetching notifications...`

### Si SSE no conecta:

1. Verificar en la consola del navegador:
   ```
   🔌 Conectando a SSE...
   ✅ SSE conectado
   ```
2. Verificar en la consola del backend:
   ```
   ✅ SSE: Cliente conectado (userId: xxx)
   ```
3. Si hay errores 401, verificar que estés autenticado

---

## 📝 Notas

- **Polling Interval**: 30 segundos (configurable en `NotificationContext.tsx`)
- **SSE Heartbeat**: 30 segundos (configurable en `notificationSSEController.ts`)
- Ambos sistemas usan las mismas rutas del backend
- El widget de notificaciones funciona con ambos sistemas sin cambios
