# ✅ CHECKLIST DE ACTIVACIÓN

Sigue estos pasos en orden. Marca cada uno cuando lo completes.

## 📋 Pre-requisitos
- [ ] Tienes acceso al dashboard de Supabase
- [ ] Tienes el proyecto abierto en VS Code
- [ ] Node.js y npm están instalados

---

## 🗄️ BASE DE DATOS

### Paso 1: Crear Tabla de Notificaciones
- [ ] Abrir Supabase Dashboard
- [ ] Ir a SQL Editor
- [ ] Crear nueva query
- [ ] Copiar todo el contenido de `Backend/prisma/CREAR_TABLA_NOTIFICACIONES.sql`
- [ ] Pegar en el editor
- [ ] Click en "Run"
- [ ] Verificar mensaje: "Success. No rows returned"

### Paso 2: Verificar Creación
- [ ] En SQL Editor, ejecutar:
```sql
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'cea' AND table_name = 'notifications'
ORDER BY ordinal_position;
```
- [ ] Verificar que aparecen 10 columnas

### Paso 3: Verificar Índices
- [ ] Ejecutar:
```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'cea' AND tablename = 'notifications';
```
- [ ] Verificar que aparecen 3 índices

### Paso 4: Verificar Políticas RLS
- [ ] Ejecutar:
```sql
SELECT policyname, cmd
FROM pg_policies
WHERE schemaname = 'cea' AND tablename = 'notifications';
```
- [ ] Verificar que aparecen 4 políticas

---

## 🔧 BACKEND

### Paso 5: Regenerar Prisma Client
- [ ] Abrir terminal en la carpeta Backend
- [ ] Ejecutar: `npx prisma generate`
- [ ] Esperar a ver: "✔ Generated Prisma Client"
- [ ] Verificar que no hay errores

### Paso 6: Verificar Archivos del Backend
- [ ] Verificar que existe: `Backend/src/controllers/notificationController.ts`
- [ ] Verificar que existe: `Backend/src/routes/notifications.ts`
- [ ] Abrir `Backend/src/index.ts`
- [ ] Verificar que incluye: `import notificationRouter from "./routes/notifications.js";`
- [ ] Verificar que incluye: `app.use("/api/notifications", notificationRouter);`

### Paso 7: Reiniciar Backend
- [ ] Si el backend está corriendo, detenerlo (Ctrl+C)
- [ ] Ejecutar: `npm run dev`
- [ ] Verificar que inicia sin errores
- [ ] Buscar en los logs: "Server is running on port..."

---

## 💻 FRONTEND

### Paso 8: Verificar Archivos del Frontend
- [ ] Verificar que existe: `Frontend/src/contexts/NotificationContext.tsx`
- [ ] Verificar que existe: `Frontend/src/components/NotificationWidget.tsx`
- [ ] Verificar que existe: `Frontend/src/pages/Notifications.tsx`

### Paso 9: Verificar Integración en App.tsx
- [ ] Abrir `Frontend/src/App.tsx`
- [ ] Verificar import: `import { NotificationProvider } from "@/contexts/NotificationContext";`
- [ ] Verificar que `<NotificationProvider>` envuelve la app
- [ ] Verificar ruta: `<Route path="notifications" element={<Notifications />} />`

### Paso 10: Verificar DashboardLayout
- [ ] Abrir `Frontend/src/components/layout/DashboardLayout.tsx`
- [ ] Verificar import: `import NotificationWidget from '../NotificationWidget';`
- [ ] Verificar que incluye: `<NotificationWidget />`

### Paso 11: Compilar Frontend
- [ ] Abrir terminal en la carpeta Frontend
- [ ] Ejecutar: `npm run dev`
- [ ] Verificar que compila sin errores
- [ ] Abrir en navegador: http://localhost:5173 (o el puerto que te indique)

---

## 🧪 PRUEBAS

### Paso 12: Obtener User ID para Prueba
- [ ] En Supabase SQL Editor, ejecutar:
```sql
SELECT id, email, full_name 
FROM cea.users 
WHERE active = true
LIMIT 1;
```
- [ ] Copiar el `id` (UUID) de un usuario

### Paso 13: Insertar Notificación de Prueba
- [ ] En SQL Editor, ejecutar (reemplaza `TU_USER_ID_AQUI`):
```sql
INSERT INTO cea.notifications (user_id, type, title, message, metadata)
VALUES (
    'TU_USER_ID_AQUI'::uuid,
    'SYSTEM_ALERT',
    '🎉 Sistema de Notificaciones Activado',
    'El sistema de notificaciones ha sido configurado exitosamente.',
    '{"test": true}'::jsonb
);
```
- [ ] Verificar: "Success. 1 row affected"

### Paso 14: Verificar Notificación en la App
- [ ] Iniciar sesión en la app con el usuario del Paso 12
- [ ] Buscar en esquina inferior derecha
- [ ] Verificar que aparece icono de campana: 🔔
- [ ] Verificar que aparece badge rojo con número: [1]

### Paso 15: Interactuar con el Widget
- [ ] Click en la campana
- [ ] Verificar que aparece popup
- [ ] Verificar que se ve la notificación de prueba
- [ ] Verificar título: "🎉 Sistema de Notificaciones Activado"

### Paso 16: Ver Página Completa
- [ ] En el popup, click en "Ver todas las notificaciones"
- [ ] Verificar que navega a: `/dashboard/notifications`
- [ ] Verificar que aparece la notificación de prueba
- [ ] Verificar que hay opciones: Marcar como leída, Eliminar

### Paso 17: Probar Acciones
- [ ] Click en el botón "Marcar como leída" ✓
- [ ] Verificar que el badge del widget disminuye
- [ ] Volver a la página de notificaciones
- [ ] Filtrar por "No leídas"
- [ ] Verificar que la notificación ya no aparece

### Paso 18: Crear Ticket de Prueba
- [ ] Obtener un ticket_id válido:
```sql
SELECT id, folio FROM cea.tickets ORDER BY created_at DESC LIMIT 1;
```
- [ ] Insertar notificación relacionada a ticket:
```sql
INSERT INTO cea.notifications (user_id, type, title, message, ticket_id, metadata)
VALUES (
    'TU_USER_ID_AQUI'::uuid,
    'TICKET_CREATED',
    '🚨 Nuevo Ticket #TKT-2024-001',
    'Se ha creado un nuevo ticket que requiere atención.',
    'TU_TICKET_ID_AQUI'::uuid,
    '{"ticketFolio": "TKT-2024-001", "priority": "urgente"}'::jsonb
);
```
- [ ] Verificar que aparece en el widget

### Paso 19: Probar Click en Notificación
- [ ] Click en la notificación de ticket
- [ ] Verificar que navega al ticket: `/dashboard/tickets/:id`

---

## 🔄 FUNCIONALIDAD AUTOMÁTICA

### Paso 20: Probar Webhook Real
- [ ] Crear un ticket nuevo en la app
- [ ] Agregar el tag: `necesita_agente`
- [ ] Guardar el ticket
- [ ] Esperar unos segundos
- [ ] Verificar en los logs del backend: "🔔 Creando notificaciones in-app..."
- [ ] Verificar en el widget que aparece nueva notificación

### Paso 21: Verificar Auto-Refresh
- [ ] Dejar la app abierta en el dashboard
- [ ] Insertar notificación desde SQL Editor
- [ ] Esperar 30 segundos (máximo)
- [ ] Verificar que el contador se actualiza automáticamente

---

## 📊 VALIDACIÓN FINAL

### Paso 22: Verificar en Base de Datos
- [ ] Ejecutar:
```sql
SELECT 
    n.id,
    n.type,
    n.title,
    n.read,
    n.created_at,
    u.email
FROM cea.notifications n
JOIN cea.users u ON n.user_id = u.id
ORDER BY n.created_at DESC
LIMIT 10;
```
- [ ] Verificar que aparecen las notificaciones creadas

### Paso 23: Verificar Estadísticas
- [ ] Ejecutar:
```sql
SELECT 
    type,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE read = true) as read_count,
    COUNT(*) FILTER (WHERE read = false) as unread_count
FROM cea.notifications
GROUP BY type;
```
- [ ] Verificar que los números coinciden con lo esperado

---

## ✅ CHECKLIST DE FUNCIONALIDADES

### Widget
- [ ] Aparece en esquina inferior derecha
- [ ] Muestra badge con contador
- [ ] Abre popup al hacer click
- [ ] Muestra últimas 5 notificaciones en popup
- [ ] Link "Ver todas" funciona

### Página de Notificaciones
- [ ] Ruta `/dashboard/notifications` funciona
- [ ] Muestra lista completa de notificaciones
- [ ] Filtro "Todas" funciona
- [ ] Filtro "No leídas" funciona
- [ ] Botón "Marcar como leída" funciona
- [ ] Botón "Eliminar" funciona
- [ ] Botón "Marcar todas como leídas" funciona
- [ ] Click en notificación navega al ticket

### API
- [ ] GET `/api/notifications` retorna notificaciones
- [ ] GET `/api/notifications?unreadOnly=true` funciona
- [ ] GET `/api/notifications/unread-count` funciona
- [ ] PATCH `/api/notifications/:id/read` funciona
- [ ] PATCH `/api/notifications/read-all` funciona
- [ ] DELETE `/api/notifications/:id` funciona

### Webhook
- [ ] Tickets con tag "necesita_agente" crean notificaciones
- [ ] Notificaciones se crean para todos los agentes
- [ ] Email se envía correctamente
- [ ] Logs muestran creación exitosa

---

## 🎉 COMPLETADO

### Si todos los checks están marcados:
- [ ] El sistema está completamente funcional
- [ ] Puedes empezar a usarlo en producción
- [ ] Los usuarios verán notificaciones automáticamente

### Próximos Pasos Opcionales:
- [ ] Personalizar colores del widget
- [ ] Agregar más tipos de notificaciones
- [ ] Configurar limpieza automática con pg_cron
- [ ] Agregar sonido de notificación
- [ ] Implementar notificaciones push

---

## 🆘 Si algo no funciona

**Revisa:**
1. ❌ ¿Algún check no está marcado?
2. 📝 Revisa `PASOS_ACTIVACION.md` para detalles
3. 📚 Consulta `SISTEMA_NOTIFICACIONES_README.md`
4. 🔍 Ve los logs del backend y frontend
5. 🐛 Ejecuta queries de `PRUEBAS_NOTIFICACIONES.sql`

---

**Fecha**: 21 de diciembre de 2025
**Status**: ⏳ En progreso → ✅ Completado
