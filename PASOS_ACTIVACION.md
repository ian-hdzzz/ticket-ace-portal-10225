# 🚀 PASOS PARA ACTIVAR EL SISTEMA DE NOTIFICACIONES

## ✅ PASO 1: Crear la Tabla en Supabase

1. Ve a tu dashboard de Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **SQL Editor** (ícono de terminal en el menú izquierdo)
4. Click en **New Query**
5. Copia y pega TODO el contenido del archivo:
   ```
   Backend/prisma/CREAR_TABLA_NOTIFICACIONES.sql
   ```
6. Click en **Run** (o presiona `Cmd/Ctrl + Enter`)
7. Deberías ver: "Success. No rows returned"

## ✅ PASO 2: Verificar la Creación

En el mismo SQL Editor, ejecuta este query:

```sql
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'cea' 
AND table_name = 'notifications'
ORDER BY ordinal_position;
```

Deberías ver 10 filas (las columnas de la tabla).

## ✅ PASO 3: Regenerar Prisma Client

En tu terminal, en la carpeta del Backend:

```bash
cd Backend
npx prisma generate
```

Espera a que termine. Deberías ver: "✔ Generated Prisma Client"

## ✅ PASO 4: Reiniciar el Backend

Si tu backend está corriendo, reinícialo:

```bash
# Detén el servidor (Ctrl+C)
# Luego inicia de nuevo
npm run dev
```

## ✅ PASO 5: Verificar que el Frontend Compile

En la carpeta Frontend:

```bash
cd Frontend
npm run dev
```

Si hay errores, déjame saber.

## ✅ PASO 6: Insertar una Notificación de Prueba

1. Ve al SQL Editor de Supabase
2. Primero obtén un user_id válido:

```sql
SELECT id, email, full_name 
FROM cea.users 
WHERE active = true
LIMIT 1;
```

3. Copia el `id` de un usuario
4. Ejecuta (reemplaza `TU_USER_ID_AQUI` con el ID que copiaste):

```sql
INSERT INTO cea.notifications (user_id, type, title, message, metadata)
VALUES (
    'TU_USER_ID_AQUI'::uuid,
    'SYSTEM_ALERT',
    '🎉 Sistema de Notificaciones Activado',
    'El sistema de notificaciones ha sido configurado exitosamente y está funcionando.',
    '{"priority": "info", "icon": "bell", "test": true}'::jsonb
);
```

## ✅ PASO 7: Ver la Notificación en la App

1. Inicia sesión en tu app con el usuario que usaste en el paso 6
2. Deberías ver:
   - 🔔 Un ícono de campana en la **esquina inferior derecha**
   - 🔴 Un badge rojo con el número `1`
3. Click en la campana
4. Deberías ver tu notificación de prueba
5. Click en "Ver todas las notificaciones"
6. Deberías ir a la página `/dashboard/notifications`

## ✅ PASO 8: Probar con Tickets Reales

Cuando se cree un ticket con el tag `"necesita_agente"`:

1. Se enviará un email (si está configurado)
2. **AHORA TAMBIÉN** se crearán notificaciones para todos los agentes activos
3. Los agentes verán:
   - Badge en el widget
   - Popup con la notificación
   - Detalles en la página de notificaciones

## 🎯 Archivos Creados/Modificados

### Backend:
- ✅ `Backend/prisma/schema.prisma` - Modelo de Notification
- ✅ `Backend/prisma/CREAR_TABLA_NOTIFICACIONES.sql` - Script SQL
- ✅ `Backend/prisma/PRUEBAS_NOTIFICACIONES.sql` - Queries de prueba
- ✅ `Backend/src/controllers/notificationController.ts` - Controlador
- ✅ `Backend/src/routes/notifications.ts` - Rutas API
- ✅ `Backend/src/index.ts` - Registro de rutas
- ✅ `Backend/src/routes/email.ts` - Ya incluye creación de notificaciones

### Frontend:
- ✅ `Frontend/src/contexts/NotificationContext.tsx` - Contexto global
- ✅ `Frontend/src/components/NotificationWidget.tsx` - Widget flotante
- ✅ `Frontend/src/pages/Notifications.tsx` - Página completa
- ✅ `Frontend/src/App.tsx` - Integración de provider y ruta
- ✅ `Frontend/src/components/layout/DashboardLayout.tsx` - Widget integrado

### Documentación:
- ✅ `SISTEMA_NOTIFICACIONES_README.md` - Documentación completa
- ✅ `PASOS_ACTIVACION.md` - Este archivo

## 🆘 Si algo no funciona

### Error: "Property 'notification' does not exist on type 'PrismaClient'"

**Solución:**
```bash
cd Backend
npx prisma generate
# Reinicia tu editor de código
# Reinicia el servidor backend
```

### No veo el widget de notificaciones

**Solución:**
1. Verifica que estás logueado
2. Verifica que estás en una ruta de `/dashboard/*`
3. Abre la consola del navegador (F12) y busca errores
4. Verifica que el NotificationProvider está en App.tsx

### Las notificaciones no se crean cuando se crea un ticket

**Solución:**
1. Verifica que el ticket tiene el tag `"necesita_agente"`
2. Revisa los logs del backend cuando se ejecuta el webhook
3. Verifica que existen usuarios con roles que incluyan "agente" o "soporte"

### Error de tipos en TypeScript

**Solución:**
```bash
# En Backend
cd Backend
npx prisma generate

# En Frontend
cd Frontend
rm -rf node_modules
npm install
```

## 📞 Siguiente Paso

Una vez que hayas completado estos pasos, avísame y podemos:

1. ✅ Probar el sistema completo
2. 🎨 Personalizar el estilo del widget
3. ⚡ Agregar más tipos de notificaciones
4. 🔔 Configurar notificaciones push (opcional)
5. 📊 Agregar analíticas de notificaciones

## 🎉 ¡Éxito!

Si ves el widget con la campana y puedes crear/ver notificaciones, **¡el sistema está funcionando correctamente!** 🎊
