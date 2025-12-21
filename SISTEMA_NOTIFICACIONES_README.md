# 🔔 Sistema de Notificaciones In-App

Sistema completo de notificaciones en tiempo real para la aplicación Ticket Ace Portal.

## 📋 Tabla de Contenidos
- [Características](#características)
- [Instalación](#instalación)
- [Configuración en Supabase](#configuración-en-supabase)
- [Uso](#uso)
- [API Endpoints](#api-endpoints)
- [Componentes Frontend](#componentes-frontend)

## ✨ Características

- 🔔 **Notificaciones en Tiempo Real**: Los usuarios reciben notificaciones cuando se crean tickets que requieren atención
- 🎯 **Widget Flotante**: Icono de campana en la esquina inferior derecha con contador de no leídas
- 📱 **Panel de Notificaciones**: Vista completa de todas las notificaciones con filtros
- ✅ **Gestión de Estado**: Marcar como leídas, eliminar, ver todas
- 🎨 **UI Moderna**: Interfaz atractiva con animaciones y transiciones suaves
- 🔒 **Seguridad RLS**: Row Level Security en Supabase para proteger datos

## 🚀 Instalación

### 1. Crear las Tablas en Supabase

Ve a tu dashboard de Supabase → SQL Editor y ejecuta el archivo:

```sql
Backend/prisma/CREAR_TABLA_NOTIFICACIONES.sql
```

Este script creará:
- ✅ Enum `NotificationType`
- ✅ Tabla `notifications`
- ✅ Índices para optimización
- ✅ Políticas RLS (Row Level Security)
- ✅ Función de limpieza automática

### 2. Verificar la Creación

Ejecuta este query para verificar:

```sql
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'cea' 
AND table_name = 'notifications'
ORDER BY ordinal_position;
```

### 3. Regenerar el Cliente Prisma

En tu backend, ejecuta:

```bash
cd Backend
npx prisma generate
```

Esto regenerará el cliente de Prisma con los nuevos modelos de notificaciones.

## 📝 Configuración en Supabase

### Políticas RLS ya configuradas:

1. **SELECT**: Los usuarios solo ven sus propias notificaciones
2. **UPDATE**: Los usuarios solo pueden actualizar sus propias notificaciones
3. **DELETE**: Los usuarios solo pueden eliminar sus propias notificaciones
4. **INSERT**: El sistema (con service_role key) puede insertar para cualquier usuario

### Verificar Políticas RLS:

```sql
SELECT policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'cea' AND tablename = 'notifications';
```

## 🔧 Uso

### Backend

El webhook de creación de tickets (`/api/email/webhook/ticket-created`) automáticamente:

1. ✅ Verifica si el ticket tiene el tag `"necesita_agente"`
2. ✅ Envía email al usuario asignado
3. ✅ **NUEVO**: Crea notificaciones in-app para todos los agentes activos

### Frontend

#### 1. El NotificationProvider está integrado en toda la app

```tsx
// Ya configurado en App.tsx
<NotificationProvider>
  <YourApp />
</NotificationProvider>
```

#### 2. Widget de Notificaciones

Aparece automáticamente en el `DashboardLayout` en la esquina inferior derecha:

- 🔔 Icono de campana flotante
- 🔴 Badge con contador de no leídas
- 📋 Popup con últimas 5 notificaciones
- 🔗 Link para ver todas

#### 3. Página de Notificaciones

Accesible desde `/dashboard/notifications`:

- 📋 Lista completa de notificaciones
- 🔍 Filtros (Todas / No leídas)
- ✅ Marcar como leída
- 🗑️ Eliminar notificación
- ✓ Marcar todas como leídas

## 🌐 API Endpoints

### GET `/api/notifications`

Obtener notificaciones del usuario autenticado.

**Query Parameters:**
- `unreadOnly=true` - Solo notificaciones no leídas

**Response:**
```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "TICKET_CREATED",
      "title": "🚨 Nuevo Ticket #TKT-2024-001",
      "message": "Se ha creado un nuevo ticket...",
      "read": false,
      "createdAt": "2024-12-21T...",
      "ticket": {
        "id": "uuid",
        "folio": "TKT-2024-001",
        "titulo": "Problema con servicio",
        "status": "abierto",
        "priority": "urgente"
      }
    }
  ],
  "unreadCount": 5
}
```

### GET `/api/notifications/unread-count`

Obtener solo el conteo de notificaciones no leídas.

**Response:**
```json
{
  "count": 5
}
```

### PATCH `/api/notifications/:id/read`

Marcar una notificación como leída.

**Response:**
```json
{
  "id": "uuid",
  "read": true,
  "readAt": "2024-12-21T..."
}
```

### PATCH `/api/notifications/read-all`

Marcar todas las notificaciones del usuario como leídas.

**Response:**
```json
{
  "message": "Todas las notificaciones marcadas como leídas"
}
```

### DELETE `/api/notifications/:id`

Eliminar una notificación.

**Response:**
```json
{
  "message": "Notificación eliminada"
}
```

## 🎨 Componentes Frontend

### NotificationProvider

Contexto global que maneja el estado de las notificaciones:

```tsx
import { useNotifications } from '@/contexts/NotificationContext';

function MyComponent() {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications
  } = useNotifications();

  // Usar las funciones...
}
```

### NotificationWidget

Widget flotante en esquina inferior derecha:

- Se muestra en todas las páginas del dashboard
- Auto-refresh cada 30 segundos
- Animaciones suaves
- Click para ver popup con últimas notificaciones

### Notifications (Página)

Página completa de notificaciones:

- Lista completa
- Filtros
- Acciones individuales
- Acción masiva (marcar todas como leídas)

## 🧪 Pruebas

### 1. Insertar Notificación de Prueba

Usa el archivo `Backend/prisma/PRUEBAS_NOTIFICACIONES.sql`:

```sql
-- Primero obtén un user_id válido
SELECT id, email FROM cea.users LIMIT 1;

-- Luego inserta una notificación
INSERT INTO cea.notifications (user_id, type, title, message, metadata)
VALUES (
    'TU_USER_ID_AQUI'::uuid,
    'SYSTEM_ALERT',
    'Notificación de Prueba',
    'Esta es una notificación de prueba del sistema.',
    '{"test": true}'::jsonb
);
```

### 2. Crear Ticket con Tag "necesita_agente"

Al crear un ticket con este tag, automáticamente se:
- ✉️ Envía email
- 🔔 Crea notificaciones para agentes

### 3. Verificar en el Frontend

1. Accede a la app
2. Ve el widget en esquina inferior derecha
3. Click en la campana
4. Ve las notificaciones
5. Click en "Ver todas" para ir a `/dashboard/notifications`

## 🔄 Mantenimiento

### Limpiar Notificaciones Antiguas

Ejecuta manualmente o programa con pg_cron:

```sql
-- Eliminar notificaciones leídas con más de 30 días
SELECT cea.cleanup_old_notifications();
```

### Monitorear Uso

```sql
-- Estadísticas de notificaciones (últimos 7 días)
SELECT 
    type as notification_type,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE read = true) as read_count,
    COUNT(*) FILTER (WHERE read = false) as unread_count
FROM cea.notifications
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY type;
```

## 🎯 Tipos de Notificaciones

```typescript
enum NotificationType {
  TICKET_CREATED          // Nuevo ticket creado
  TICKET_ASSIGNED         // Ticket asignado a ti
  TICKET_STATUS_CHANGED   // Cambio de estado
  TICKET_PRIORITY_CHANGED // Cambio de prioridad
  TICKET_COMMENT          // Nuevo comentario
  SYSTEM_ALERT            // Alerta del sistema
}
```

## 🐛 Troubleshooting

### No aparecen notificaciones

1. ✅ Verifica que la tabla existe en Supabase
2. ✅ Verifica que `npx prisma generate` se ejecutó
3. ✅ Verifica que el backend está corriendo
4. ✅ Verifica las políticas RLS en Supabase
5. ✅ Revisa la consola del navegador por errores

### Widget no se muestra

1. ✅ Verifica que estás en una ruta del dashboard
2. ✅ Verifica que el `NotificationProvider` envuelve la app
3. ✅ Revisa que `shadcn` Popover y Badge están instalados

### Backend no crea notificaciones

1. ✅ Verifica los logs del webhook
2. ✅ Verifica que existen usuarios con rol de agente
3. ✅ Verifica la conexión a la base de datos

## 📚 Recursos

- [Prisma Docs](https://www.prisma.io/docs)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [shadcn/ui](https://ui.shadcn.com/)
- [React Query](https://tanstack.com/query/latest)

## 🎉 ¡Listo!

El sistema de notificaciones está completamente configurado y listo para usar.

