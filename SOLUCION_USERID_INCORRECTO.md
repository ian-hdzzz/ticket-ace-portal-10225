# 🔍 DIAGNÓSTICO: Notificaciones con userId incorrecto

## 🎯 Problema Identificado

Las notificaciones **SÍ están en Supabase**, pero el backend responde con array vacío porque:

**El `userId` en las notificaciones NO coincide con el `userId` del usuario logueado**

### En Supabase vemos:
```
userId: dd316d49-489f-4e7f-84c1-6b7e0b08e20f
```

### El backend busca notificaciones para:
```
userId: <El ID del usuario que está logueado>
```

## 🔧 SOLUCIÓN EN 3 PASOS

### **Paso 1: Identificar tu userId correcto**

Ejecuta esto en Supabase SQL Editor:

```sql
-- Si sabes tu email, usa esto:
SELECT id, email, name, active 
FROM users 
WHERE email = 'TU_EMAIL@ejemplo.com';  -- 👈 CAMBIAR

-- O lista todos los usuarios activos:
SELECT id, email, name, active 
FROM users 
WHERE active = true
ORDER BY email;
```

**Copia el `id` del usuario con el que estás logueado.** Por ejemplo: `12345678-1234-1234-1234-123456789012`

---

### **Paso 2: Verificar las notificaciones actuales**

```sql
-- Ver qué userId tienen las notificaciones
SELECT 
  n.id,
  n."userId" as userId_actual,
  n.title,
  u.email as email_del_usuario,
  u.name as nombre_del_usuario
FROM notifications n
LEFT JOIN users u ON u.id = n."userId"
ORDER BY n."createdAt" DESC;
```

**¿El email coincide con el tuyo?**
- ✅ **Sí:** El problema es otro (ve al final)
- ❌ **No:** El userId está mal, continúa al Paso 3

---

### **Paso 3: Actualizar el userId en las notificaciones**

**OPCIÓN A - Actualizar notificaciones existentes:**

```sql
-- ⚠️ IMPORTANTE: Reemplaza estos valores antes de ejecutar
-- TU_USER_ID_CORRECTO = El ID que copiaste en el Paso 1
-- dd316d49-489f-4e7f-84c1-6b7e0b08e20f = El userId incorrecto actual

-- PRIMERO: Ver qué se va a cambiar (SOLO lectura, seguro)
SELECT 
  id,
  "userId" as userId_anterior,
  'TU_USER_ID_CORRECTO_AQUI' as userId_nuevo,  -- 👈 REEMPLAZAR
  title,
  "createdAt"
FROM notifications
WHERE "userId" = 'dd316d49-489f-4e7f-84c1-6b7e0b08e20f';

-- SI TODO SE VE BIEN, ejecuta el UPDATE:
UPDATE notifications 
SET "userId" = 'TU_USER_ID_CORRECTO_AQUI'  -- 👈 REEMPLAZAR
WHERE "userId" = 'dd316d49-489f-4e7f-84c1-6b7e0b08e20f';

-- Verificar que funcionó:
SELECT 
  n.id,
  n."userId",
  n.title,
  u.email,
  u.name
FROM notifications n
INNER JOIN users u ON u.id = n."userId"
ORDER BY n."createdAt" DESC;
```

**OPCIÓN B - Actualizar TODAS las notificaciones a tu usuario:**

```sql
-- ⚠️ CUIDADO: Esto asigna TODAS las notificaciones a tu usuario
UPDATE notifications 
SET "userId" = 'TU_USER_ID_CORRECTO_AQUI';  -- 👈 REEMPLAZAR
```

---

### **Paso 4: Probar en el frontend**

1. Recarga la página del frontend
2. El endpoint `/api/notifications` debería devolver las notificaciones
3. El widget debe mostrar el badge con el número

---

## 🐛 Si TODAVÍA no funciona:

### A. Verificar que estás logueado con el usuario correcto

Abre la consola del navegador (F12 > Console) y ejecuta:

```javascript
// Ver las cookies actuales
document.cookie;

// Probar el endpoint con el usuario actual
fetch('/api/notifications', { credentials: 'include' })
  .then(r => r.json())
  .then(d => {
    console.log('Respuesta:', d);
    console.log('Total notificaciones:', d.notifications?.length);
  });
```

### B. Ver los logs del backend

En la terminal del backend, cuando hagas el request, deberías ver algo como:

```
{
  userId: '12345678-1234-1234-1234-123456789012',
  email: 'tu@email.com',
  full_name: 'Tu Nombre',
  roles: [...],
  privileges: [...]
}
```

**Copia ese `userId` y verifica que coincida con el de las notificaciones.**

### C. Ejecutar query de diagnóstico completo

```sql
-- Este query muestra TODO el problema
WITH user_logueado AS (
  SELECT id FROM users WHERE email = 'TU_EMAIL@ejemplo.com'  -- 👈 CAMBIAR
),
notif_stats AS (
  SELECT 
    COUNT(*) as total_notificaciones,
    COUNT(DISTINCT "userId") as usuarios_diferentes,
    array_agg(DISTINCT "userId") as user_ids_unicos
  FROM notifications
)
SELECT 
  'Usuario Logueado' as tipo,
  (SELECT id::text FROM user_logueado) as user_id,
  '-' as info
UNION ALL
SELECT 
  'Notificaciones en DB',
  total_notificaciones::text,
  'Para ' || usuarios_diferentes::text || ' usuario(s)'
FROM notif_stats
UNION ALL
SELECT 
  'UserIds en Notificaciones',
  unnest(user_ids_unicos)::text,
  (SELECT email FROM users WHERE id = unnest(user_ids_unicos))
FROM notif_stats;
```

---

## 🎯 Causa Raíz del Problema

El webhook que crea las notificaciones está obteniendo el `userId` de los usuarios con rol de agente, pero probablemente:

1. **Estás logueado con un usuario diferente** (ej: admin)
2. **Los usuarios "agente" no son los que estás usando** para probar
3. **El userId se está obteniendo incorrectamente** en el webhook

### Solución Permanente:

Modifica el webhook para que también cree notificaciones para administradores:

```typescript
// En Backend/src/routes/email.ts, línea ~570
const agentRoles = await prisma.Role.findMany({
  where: {
    OR: [
      { name: { contains: 'agente', mode: 'insensitive' } },
      { name: { contains: 'agent', mode: 'insensitive' } },
      { name: { contains: 'soporte', mode: 'insensitive' } },
      { name: { contains: 'support', mode: 'insensitive' } },
      { name: { contains: 'admin', mode: 'insensitive' } },      // 👈 AGREGAR
      { name: { contains: 'administrador', mode: 'insensitive' } } // 👈 AGREGAR
    ]
  },
  // ...
});
```

---

## ✅ Checklist de Verificación

- [ ] Obtuve mi userId correcto de la tabla `users`
- [ ] Verifiqué que las notificaciones tienen un userId diferente
- [ ] Ejecuté el UPDATE para cambiar el userId
- [ ] Recargué la página del frontend
- [ ] Las notificaciones ahora aparecen en el widget
- [ ] Agregué roles de admin al webhook (opcional)

---

**Archivos de referencia:**
- `QUERY_DIAGNOSTICO_USERID.sql` - Queries de diagnóstico detallados
- `VERIFICAR_NOTIFICACIONES.sql` - Queries de verificación general

