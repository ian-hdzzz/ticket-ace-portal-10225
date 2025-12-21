-- 🚀 SOLUCIÓN RÁPIDA: Asignar notificaciones a tu usuario

-- PASO 1: Encuentra tu userId
-- Ejecuta este query y copia tu ID:
SELECT id, email, name 
FROM users 
WHERE email ILIKE '%tu_email%'  -- 👈 Cambia 'tu_email' por parte de tu email
   OR name ILIKE '%tu_nombre%';  -- 👈 O por parte de tu nombre

-- Resultado esperado (ejemplo):
-- id: 12345678-abcd-1234-abcd-123456789012
-- email: admin@ceaqueretaro.gob.mx
-- name: Administrador


-- PASO 2: Ver las notificaciones actuales
SELECT 
  n.id,
  n."userId",
  n.title,
  n.read,
  u.email as usuario_email,
  u.name as usuario_nombre
FROM notifications n
LEFT JOIN users u ON u.id = n."userId"
ORDER BY n."createdAt" DESC;


-- PASO 3A: Si el usuario NO existe o es incorrecto
-- Actualiza TODAS las notificaciones a TU usuario:
-- ⚠️ REEMPLAZA 'TU_USER_ID_AQUI' con el ID que copiaste en PASO 1

UPDATE notifications 
SET "userId" = 'TU_USER_ID_AQUI'  -- 👈👈👈 CAMBIAR ESTO
WHERE true;  -- Actualiza todas

-- Ejemplo real (NO USES ESTE, USA EL TUYO):
-- UPDATE notifications SET "userId" = '12345678-abcd-1234-abcd-123456789012';


-- PASO 3B: O solo actualiza las del userId incorrecto
-- ⚠️ REEMPLAZA ambos valores

UPDATE notifications 
SET "userId" = 'TU_USER_ID_CORRECTO'  -- 👈 Tu ID real
WHERE "userId" = 'dd316d49-489f-4e7f-84c1-6b7e0b08e20f';  -- 👈 El ID incorrecto


-- PASO 4: Verificar que funcionó
SELECT 
  n.id,
  n."userId",
  n.title,
  n.read,
  n."createdAt",
  u.email,
  u.name
FROM notifications n
INNER JOIN users u ON u.id = n."userId"
ORDER BY n."createdAt" DESC;

-- ✅ Ahora deberías ver tu email y nombre en los resultados


-- PASO 5 (Opcional): Crear una notificación de prueba directamente
-- ⚠️ REEMPLAZA 'TU_USER_ID_AQUI'

INSERT INTO notifications (
  id,
  "userId",
  type,
  title,
  message,
  read,
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'TU_USER_ID_AQUI',  -- 👈👈👈 CAMBIAR ESTO
  'SYSTEM_ALERT',
  '🎉 Notificación de Prueba',
  'Si puedes ver esto, el sistema funciona correctamente!',
  false,
  NOW(),
  NOW()
);


-- PASO 6: Limpiar notificaciones de prueba (opcional)
-- DELETE FROM notifications WHERE title LIKE '%Prueba%';
