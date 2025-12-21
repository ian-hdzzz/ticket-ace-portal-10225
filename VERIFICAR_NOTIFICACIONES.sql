-- 🔍 VERIFICACIÓN RÁPIDA DE NOTIFICACIONES
-- Ejecuta estos queries en Supabase SQL Editor para diagnosticar

-- 1️⃣ Ver todas las notificaciones creadas
SELECT 
  n.id,
  n."userId",
  n.type,
  n.title,
  n.message,
  n."ticketId",
  n.read,
  n."createdAt",
  u.email as user_email,
  u.name as user_name,
  u.active as user_active
FROM notifications n
LEFT JOIN users u ON u.id = n."userId"
ORDER BY n."createdAt" DESC
LIMIT 20;

-- 2️⃣ Contar notificaciones por usuario
SELECT 
  u.email,
  u.name,
  COUNT(*) as total_notificaciones,
  COUNT(*) FILTER (WHERE n.read = false) as no_leidas,
  COUNT(*) FILTER (WHERE n.read = true) as leidas
FROM notifications n
INNER JOIN users u ON u.id = n."userId"
GROUP BY u.id, u.email, u.name
ORDER BY total_notificaciones DESC;

-- 3️⃣ Verificar usuarios con rol de agente
SELECT 
  u.id,
  u.email,
  u.name,
  u.active,
  r.name as role_name,
  r.id as role_id
FROM users u
INNER JOIN user_roles ur ON ur."userId" = u.id
INNER JOIN roles r ON r.id = ur."roleId"
WHERE 
  r.name ILIKE '%agente%' 
  OR r.name ILIKE '%agent%' 
  OR r.name ILIKE '%soporte%'
  OR r.name ILIKE '%support%'
ORDER BY u.active DESC, u.email;

-- 4️⃣ Ver últimos tickets creados con tag "necesita_agente"
SELECT 
  id,
  folio,
  titulo,
  status,
  priority,
  tags,
  "created_at"
FROM tickets
WHERE 
  tags @> ARRAY['necesita_agente']::text[]
  OR tags::text ILIKE '%necesita_agente%'
ORDER BY "created_at" DESC
LIMIT 10;

-- 5️⃣ Verificar si tu usuario actual tiene notificaciones
-- REEMPLAZA 'tu_email@ejemplo.com' con tu email real
SELECT 
  n.id,
  n.type,
  n.title,
  n.message,
  n.read,
  n."createdAt",
  t.folio as ticket_folio,
  t.titulo as ticket_titulo
FROM notifications n
INNER JOIN users u ON u.id = n."userId"
LEFT JOIN tickets t ON t.id = n."ticketId"
WHERE u.email = 'tu_email@ejemplo.com'  -- 👈 CAMBIAR AQUÍ
ORDER BY n."createdAt" DESC;

-- 6️⃣ Estadísticas generales
SELECT 
  'Total Notificaciones' as metrica,
  COUNT(*)::text as valor
FROM notifications
UNION ALL
SELECT 
  'Notificaciones No Leídas',
  COUNT(*)::text
FROM notifications
WHERE read = false
UNION ALL
SELECT 
  'Usuarios con Notificaciones',
  COUNT(DISTINCT "userId")::text
FROM notifications
UNION ALL
SELECT 
  'Tickets con Tag necesita_agente',
  COUNT(*)::text
FROM tickets
WHERE tags @> ARRAY['necesita_agente']::text[]
   OR tags::text ILIKE '%necesita_agente%';

-- 7️⃣ Ver metadata de las notificaciones
SELECT 
  id,
  title,
  type,
  metadata,
  "createdAt"
FROM notifications
ORDER BY "createdAt" DESC
LIMIT 10;

-- 8️⃣ Verificar roles disponibles en el sistema
SELECT 
  id,
  name,
  description,
  COUNT(ur."userId") as usuarios_con_este_rol
FROM roles r
LEFT JOIN user_roles ur ON ur."roleId" = r.id
GROUP BY r.id, r.name, r.description
ORDER BY name;

-- ✅ QUERY FINAL: Todo en uno
-- Este query muestra si el sistema está funcionando correctamente
SELECT 
  'Sistema de Notificaciones' as componente,
  CASE 
    WHEN (SELECT COUNT(*) FROM notifications) > 0 THEN '✅ Hay notificaciones'
    ELSE '❌ No hay notificaciones'
  END as estado,
  (SELECT COUNT(*) FROM notifications)::text as total
UNION ALL
SELECT 
  'Usuarios Agentes Activos',
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Hay agentes'
    ELSE '❌ No hay agentes'
  END,
  COUNT(*)::text
FROM users u
INNER JOIN user_roles ur ON ur."userId" = u.id
INNER JOIN roles r ON r.id = ur."roleId"
WHERE 
  u.active = true
  AND (
    r.name ILIKE '%agente%' 
    OR r.name ILIKE '%agent%' 
    OR r.name ILIKE '%soporte%'
  )
UNION ALL
SELECT 
  'Tickets con necesita_agente',
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Hay tickets'
    ELSE '⚠️ No hay tickets'
  END,
  COUNT(*)::text
FROM tickets
WHERE tags @> ARRAY['necesita_agente']::text[]
   OR tags::text ILIKE '%necesita_agente%';
