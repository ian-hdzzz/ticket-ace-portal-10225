-- 🔍 DIAGNÓSTICO: ¿Por qué el backend no encuentra las notificaciones?
-- El problema es que el userId del usuario logueado NO coincide con el userId en las notificaciones

-- 1️⃣ Ver el userId que está en las notificaciones
SELECT DISTINCT 
  n."userId" as user_id_en_notificaciones,
  u.email,
  u.name,
  u.active
FROM notifications n
LEFT JOIN users u ON u.id = n."userId"
ORDER BY n."userId";

-- 2️⃣ Ver TODOS los usuarios del sistema con sus IDs
SELECT 
  id as user_id,
  email,
  name,
  active
FROM users
ORDER BY email;

-- 3️⃣ Ver las notificaciones con el email del usuario
SELECT 
  n.id as notification_id,
  n."userId",
  n.title,
  n.read,
  u.email,
  u.name
FROM notifications n
LEFT JOIN users u ON u.id = n."userId"
ORDER BY n."createdAt" DESC
LIMIT 20;

-- 4️⃣ Verificar si el userId coincide
-- Este query muestra si las notificaciones apuntan a un usuario que existe
SELECT 
  COUNT(*) as total_notificaciones,
  COUNT(CASE WHEN u.id IS NOT NULL THEN 1 END) as con_usuario_valido,
  COUNT(CASE WHEN u.id IS NULL THEN 1 END) as con_usuario_inexistente
FROM notifications n
LEFT JOIN users u ON u.id = n."userId";

-- 5️⃣ 🎯 SOLUCIÓN: Actualizar el userId de las notificaciones existentes
-- Si las notificaciones tienen un userId incorrecto, usa este query para corregirlo
-- PRIMERO ejecuta este para ver qué se va a cambiar:
SELECT 
  n.id as notification_id,
  n."userId" as userId_actual,
  'REEMPLAZAR_CON_TU_USER_ID' as userId_correcto,  -- 👈 CAMBIAR
  n.title,
  n."createdAt"
FROM notifications n
WHERE n."userId" = 'dd316d49-489f-4e7f-84c1-6b7e0b08e20f';  -- 👈 userId que aparece en las notificaciones

-- 6️⃣ Para obtener TU userId (el usuario con el que estás logueado):
-- Opción A: Si sabes tu email
SELECT id, email, name FROM users WHERE email = 'TU_EMAIL@ejemplo.com';

-- Opción B: Ver todos los usuarios agentes
SELECT 
  u.id,
  u.email,
  u.name,
  u.active,
  r.name as role
FROM users u
INNER JOIN user_roles ur ON ur."userId" = u.id
INNER JOIN roles r ON r.id = ur."roleId"
WHERE 
  u.active = true
  AND (
    r.name ILIKE '%agente%' 
    OR r.name ILIKE '%admin%'
  )
ORDER BY u.email;

-- 7️⃣ 🔧 ACTUALIZAR las notificaciones al userId correcto
-- ⚠️ CUIDADO: Solo ejecuta esto después de verificar los IDs correctos
-- UPDATE notifications 
-- SET "userId" = 'TU_USER_ID_CORRECTO_AQUI'  -- 👈 Reemplazar con tu ID real
-- WHERE "userId" = 'dd316d49-489f-4e7f-84c1-6b7e0b08e20f';

-- 8️⃣ Verificar después del UPDATE
-- SELECT 
--   n.id,
--   n."userId",
--   n.title,
--   u.email,
--   u.name
-- FROM notifications n
-- INNER JOIN users u ON u.id = n."userId"
-- ORDER BY n."createdAt" DESC;
