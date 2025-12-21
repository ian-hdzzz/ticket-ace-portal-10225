# 🔄 Sistema de Notificaciones en Tiempo Real - SSE vs Polling

## 📊 Resumen Ejecutivo

Este documento explica las **dos implementaciones** del sistema de notificaciones:
1. **Polling (actual)** - Revisa cada 30 segundos
2. **SSE (nueva)** - Notificaciones instantáneas en tiempo real

---

## 🎯 Respuestas a tus Preguntas

### 1. ¿Por qué no existía el modelo Notification en Prisma?

**PROBLEMA RESUELTO ✅**

El modelo **SÍ existía** en `schema.prisma` pero no se estaba usando correctamente:

```typescript
// ❌ INCORRECTO (en notificationController.ts)
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// ✅ CORRECTO (ahora)
import { prisma } from '../utils/prisma.js';
```

**Solución aplicada:**
- ✅ Modificado `notificationController.ts` para usar el prisma correcto
- ✅ Modificado `email.ts` para usar el prisma correcto
- ✅ Ejecutado `npx prisma generate` para regenerar el cliente

---

### 2. ¿Cómo funciona el flujo actual y cómo implementar SSE?

## 📡 Comparación de Implementaciones

### A) POLLING (Implementación Original)

#### Flujo:
```
┌─────────────────┐
│  Supabase DB    │
│  (Trigger)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Webhook       │
│   /api/email    │
└────────┬────────┘
         │
         ├─► Envía email
         │
         └─► Crea notificaciones en DB
                      │
                      ▼
              ┌──────────────┐
              │  Frontend    │◄──────┐
              │  (Polling)   │       │
              └──────────────┘       │
                      │              │
                      └──────────────┘
                   Cada 30 segundos
```

#### Código Frontend (Polling):
```typescript
// NotificationContext.tsx
useEffect(() => {
  const interval = setInterval(() => {
    fetchNotifications(); // Request HTTP cada 30s
  }, 30000);
  
  return () => clearInterval(interval);
}, []);
```

#### Ventajas:
- ✅ Simple de implementar
- ✅ Compatible con cualquier servidor

#### Desventajas:
- ❌ **Delay de 0-30 segundos**
- ❌ Requests innecesarios (desperdicio de recursos)
- ❌ No es tiempo real
- ❌ Mayor carga en el servidor

---

### B) SSE - Server-Sent Events (Nueva Implementación)

#### Flujo:
```
┌─────────────────┐
│  Supabase DB    │
│  (Trigger)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Webhook       │
│   /api/email    │
└────────┬────────┘
         │
         ├─► Envía email
         │
         ├─► Crea notificaciones en DB
         │
         └─► 🔥 Emite evento SSE
                      │
                      ▼
              ┌──────────────┐
              │  Frontend    │
              │  EventSource │◄─── Conexión persistente
              └──────────────┘
                      │
                      └─► Recibe evento INMEDIATAMENTE ⚡
```

#### Código Backend (SSE):
```typescript
// notificationSSEController.ts
const clients = new Set<SSEClient>(); // Store de conexiones

// Endpoint que mantiene conexión abierta
async streamNotifications(req, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  const client = { userId, response: res };
  clients.add(client); // Agregar cliente
  
  // Heartbeat cada 30s para mantener conexión viva
  setInterval(() => res.write(': heartbeat\n\n'), 30000);
}

// Emitir evento a usuarios específicos
emitNotification(userIds, notification) {
  clients.forEach(client => {
    if (userIds.includes(client.userId)) {
      client.response.write(`data: ${JSON.stringify(notification)}\n\n`);
    }
  });
}
```

#### Código Frontend (SSE):
```typescript
// NotificationContextSSE.tsx
const connectSSE = () => {
  const eventSource = new EventSource('/api/notifications/stream', {
    withCredentials: true
  });

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    if (data.type === 'notification') {
      // ⚡ Recibir notificación INSTANTÁNEAMENTE
      setNotifications(prev => [data.data, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Mostrar toast
      toast(data.data.title, {
        description: data.data.message
      });
    }
  };

  eventSource.onerror = () => {
    // Auto-reconexión después de 5s
    setTimeout(() => connectSSE(), 5000);
  };
};
```

#### Ventajas:
- ✅ **Notificaciones instantáneas** (0 segundos de delay)
- ✅ Una sola conexión HTTP persistente
- ✅ Menor carga en el servidor
- ✅ Auto-reconexión automática
- ✅ Heartbeat para mantener conexión viva
- ✅ Compatible con navegadores modernos

#### Desventajas:
- ❌ Requiere soporte de SSE en el servidor
- ❌ Conexión persistente por usuario

---

## 🔧 Archivos Modificados/Creados

### Backend:

#### ✅ Modificados:
1. **`src/controllers/notificationController.ts`**
   - Cambiado `PrismaClient` → `prisma` desde utils

2. **`src/routes/email.ts`**
   - Cambiado `PrismaClient` → `prisma` desde utils
   - Agregado import de `emitNotificationToUsers`
   - Agregada lógica SSE después de crear notificaciones (línea ~620)

3. **`src/routes/notifications.ts`**
   - Agregado endpoint `/stream` para SSE

#### 🆕 Creados:
1. **`src/controllers/notificationSSEController.ts`** (NUEVO)
   - Store de clientes conectados
   - Endpoint `/api/notifications/stream`
   - Función `emitNotificationToUsers()` para broadcast

### Frontend:

#### 🆕 Creados:
1. **`src/contexts/NotificationContextSSE.tsx`** (NUEVO)
   - Reemplazo de NotificationContext.tsx con SSE
   - EventSource en lugar de polling
   - Auto-reconexión automática
   - Estado `connected` para debugging

---

## 🚀 Cómo Activar SSE

### Opción 1: Reemplazar el Context (Recomendado)

```bash
cd Frontend/src/contexts
mv NotificationContext.tsx NotificationContext.BACKUP.tsx
mv NotificationContextSSE.tsx NotificationContext.tsx
```

### Opción 2: Modificar App.tsx

```typescript
// Frontend/src/App.tsx
// ❌ Comentar la línea actual:
// import { NotificationProvider } from "./contexts/NotificationContext";

// ✅ Usar la nueva con SSE:
import { NotificationProvider } from "./contexts/NotificationContextSSE";
```

---

## 🧪 Cómo Probar

### 1. Verificar que el backend esté corriendo:
```bash
cd Backend
npm run dev
```

### 2. Verificar que el frontend esté corriendo:
```bash
cd Frontend
npm run dev
```

### 3. En el navegador, abrir DevTools:
- Pestaña **Network**
- Filtrar por "stream"
- Deberías ver una conexión persistente a `/api/notifications/stream`
- Tipo: `eventsource`
- Estado: `pending` (conexión abierta)

### 4. Crear un ticket con tag "necesita_agente":
```sql
-- En Supabase SQL Editor
INSERT INTO cea.tickets (
  titulo, descripcion, priority, status, channel, tags
) VALUES (
  'Ticket de prueba', 
  'Probando SSE', 
  'high', 
  'open', 
  'web',
  'necesita_agente'
);
```

### 5. Verificar:
- ✅ En la consola del **backend** deberías ver:
  ```
  🔔 Creando notificaciones in-app...
  ✅ 3 notificaciones creadas para agentes
  📡 SSE: Eventos enviados a 2 clientes conectados
  ```

- ✅ En la consola del **frontend** deberías ver:
  ```
  🔔 Nueva notificación recibida: {...}
  ```

- ✅ En la **UI** deberías ver:
  - Toast emergente con la notificación
  - Badge en el widget con el contador actualizado
  - Notificación en la lista

---

## 📊 Comparación de Rendimiento

| Métrica | Polling (30s) | SSE |
|---------|---------------|-----|
| **Delay promedio** | 15 segundos | 0 segundos ⚡ |
| **Delay máximo** | 30 segundos | 0 segundos |
| **Requests/hora (por usuario)** | 120 | 1 (+ heartbeats) |
| **Tráfico de red** | Alto | Bajo |
| **Carga del servidor** | Alta | Baja |
| **Escalabilidad** | Media | Alta |
| **Experiencia del usuario** | Mala | Excelente ✨ |

---

## 🐛 Debugging

### Ver clientes SSE conectados:

```typescript
// Backend - Agregar endpoint temporal
router.get('/debug/sse-clients', (req, res) => {
  const info = notificationSSEController.getConnectedClients();
  res.json(info);
});
```

### Logs útiles:

**Backend:**
```
✅ SSE: Cliente conectado (userId: abc-123). Total clientes: 3
📡 SSE: Eventos enviados a 2/3 clientes conectados
❌ SSE: Cliente desconectado (userId: abc-123). Total clientes: 2
```

**Frontend:**
```
🔌 Conectando a SSE...
✅ SSE conectado
🔔 Nueva notificación recibida: {...}
❌ Error en SSE: ...
🔄 Reintentando conexión SSE en 5 segundos...
```

---

## ❓ FAQ

### ¿Qué pasa si el usuario cierra la pestaña?
La conexión SSE se cierra automáticamente y se elimina del store.

### ¿Qué pasa si se cae el servidor?
El frontend intenta reconectar automáticamente cada 5 segundos.

### ¿Cuántas conexiones SSE puede manejar el servidor?
Con Node.js, fácilmente miles de conexiones simultáneas.

### ¿Funciona en producción?
Sí, pero asegúrate de configurar:
- Timeout largo en tu proxy/load balancer
- `X-Accel-Buffering: no` para Nginx
- Keep-alive en tu servidor

### ¿Puedo usar ambos sistemas?
Sí, puedes tener SSE como primario y polling como fallback.

---

## 📝 Conclusión

**RECOMENDACIÓN: Usar SSE** 🚀

El sistema SSE ofrece:
- ⚡ Notificaciones instantáneas
- 🎯 Mejor experiencia de usuario
- 💪 Menor carga en el servidor
- 📱 Compatible con todos los navegadores modernos

El sistema de polling es útil como fallback, pero SSE es superior en todos los aspectos para notificaciones en tiempo real.
