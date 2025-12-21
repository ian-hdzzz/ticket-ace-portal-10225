# 🔍 Cómo Verificar si SSE está Funcionando

## Método 1: Consola del Navegador

Abre **DevTools (F12)** → **Console** y busca estos logs:

### ✅ Si SSE está activo:
```
🔄 [SSE] Fetching notifications...
📥 [SSE] Response status: 200
✅ [SSE] Notifications received: { count: 1, unread: 0, ... }
🔌 Conectando a SSE...
✅ SSE conectado
📡 SSE: Conexión confirmada
```

### ❌ Si solo está haciendo fetch (sin SSE):
```
🔄 [SSE] Fetching notifications...
📥 [SSE] Response status: 200
✅ [SSE] Notifications received: { count: 1, unread: 0, ... }
(sin los mensajes de "Conectando a SSE")
```

---

## Método 2: Network Tab (DevTools)

1. Abre **DevTools (F12)** → **Network**
2. Filtra por "stream" o busca `/api/notifications/stream`
3. **Si ves una petición con:**
   - Type: `eventsource` o `EventStream`
   - Status: `(pending)` o `200`
   - **Y la petición NO se completa** (se queda en pending)
   
   ✅ **SSE está funcionando correctamente**

4. **Si NO ves esa petición:**
   
   ❌ **SSE no está conectado**

---

## Método 3: Indicador Visual en el Widget

Abre el widget de notificaciones (🔔):

- **🟢 Live** = SSE conectado (Tiempo Real)
- **⚪ Offline** = SSE desconectado (Solo fetch)

---

## Método 4: Terminal del Backend

En la terminal donde corre el backend, deberías ver:

```
✅ SSE: Cliente conectado (userId: xxx). Total clientes: 1
```

Cada vez que un usuario abre la app, debería aparecer este mensaje.

---

## ¿Qué significa cada escenario?

### 🟢 Escenario Ideal (SSE Activo):
- ✅ Conexión persistente abierta
- ✅ Notificaciones en tiempo real (< 1 segundo)
- ✅ Sin polling (0 peticiones repetidas)
- ✅ Indicador "🟢 Live" en el widget

### ⚪ Fallback (Solo Fetch):
- ⚠️ Solo se hace el fetch inicial
- ⚠️ No hay conexión SSE
- ⚠️ Las notificaciones solo se actualizan al recargar la página
- ⚠️ Indicador "⚪ Offline" en el widget

---

## Prueba Rápida:

1. Abre la app en 2 pestañas diferentes
2. En la terminal del backend deberías ver:
   ```
   ✅ SSE: Cliente conectado (userId: xxx). Total clientes: 2
   ```
3. Si ves "Total clientes: 2", **SSE está funcionando**

---

## Solución si SSE no conecta:

1. Verifica que el backend esté en puerto `8081`
2. Reinicia el frontend después de cambiar `vite.config.ts`
3. Verifica en Network tab que `/api/notifications/stream` se esté llamando
4. Revisa la consola para ver errores de autenticación (401)
