-- ============================================
-- QUERIES DE PRUEBA PARA NOTIFICACIONES
-- ============================================

-- 1. Insertar una notificación de prueba
-- IMPORTANTE: Reemplaza 'TU_USER_ID_AQUI' con un ID real de usuario de la tabla cea.users
INSERT INTO cea.notifications (user_id, type, title, message, metadata)
VALUES (
    'TU_USER_ID_AQUI'::uuid,  -- Reemplaza con un UUID real
    'SYSTEM_ALERT',
    'Sistema de Notificaciones Activado',
    'El sistema de notificaciones ha sido configurado exitosamente.',
    '{"priority": "info", "icon": "bell"}'::jsonb
);

-- 2. Insertar notificación relacionada a un ticket
-- IMPORTANTE: Reemplaza los UUIDs con valores reales
INSERT INTO cea.notifications (user_id, type, title, message, ticket_id, metadata)
VALUES (
    'TU_USER_ID_AQUI'::uuid,  -- Reemplaza con un UUID real de usuario
    'TICKET_CREATED',
    'Nuevo Ticket Creado',
    'Se ha creado un nuevo ticket que requiere atención de un agente.',
    'TU_TICKET_ID_AQUI'::uuid,  -- Reemplaza con un UUID real de ticket
    jsonb_build_object(
        'ticketFolio', 'TKT-2024-001',
        'priority', 'urgente',
        'needsAgent', true
    )
);

-- 3. Ver todas las notificaciones (para admin)
SELECT 
    n.id,
    n.type,
    n.title,
    n.message,
    n.read,
    n.created_at,
    u.email as user_email,
    u.full_name as user_name,
    t.folio as ticket_folio
FROM cea.notifications n
LEFT JOIN cea.users u ON n.user_id = u.id
LEFT JOIN cea.tickets t ON n.ticket_id = t.id
ORDER BY n.created_at DESC
LIMIT 20;

-- 4. Ver notificaciones no leídas de un usuario específico
SELECT 
    n.id,
    n.type,
    n.title,
    n.message,
    n.created_at,
    t.folio as ticket_folio,
    t.status as ticket_status
FROM cea.notifications n
LEFT JOIN cea.tickets t ON n.ticket_id = t.id
WHERE n.user_id = 'TU_USER_ID_AQUI'::uuid  -- Reemplaza con UUID real
AND n.read = false
ORDER BY n.created_at DESC;

-- 5. Contar notificaciones no leídas por usuario
SELECT 
    u.email,
    u.full_name,
    COUNT(*) as unread_count
FROM cea.notifications n
JOIN cea.users u ON n.user_id = u.id
WHERE n.read = false
GROUP BY u.id, u.email, u.full_name
ORDER BY unread_count DESC;

-- 6. Marcar notificación como leída
UPDATE cea.notifications
SET read = true, read_at = NOW()
WHERE id = 'TU_NOTIFICATION_ID_AQUI'::uuid;  -- Reemplaza con UUID real

-- 7. Marcar todas las notificaciones de un usuario como leídas
UPDATE cea.notifications
SET read = true, read_at = NOW()
WHERE user_id = 'TU_USER_ID_AQUI'::uuid  -- Reemplaza con UUID real
AND read = false;

-- 8. Eliminar notificaciones antiguas leídas (más de 30 días)
DELETE FROM cea.notifications
WHERE read = true 
AND read_at < NOW() - INTERVAL '30 days';

-- 9. Obtener estadísticas de notificaciones
SELECT 
    type as notification_type,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE read = true) as read_count,
    COUNT(*) FILTER (WHERE read = false) as unread_count,
    ROUND(AVG(EXTRACT(EPOCH FROM (read_at - created_at))/60), 2) as avg_read_time_minutes
FROM cea.notifications
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY type
ORDER BY total DESC;

-- 10. Ver los últimos usuarios activos (que han leído notificaciones recientemente)
SELECT 
    u.email,
    u.full_name,
    MAX(n.read_at) as last_notification_read,
    COUNT(*) as total_notifications_read
FROM cea.notifications n
JOIN cea.users u ON n.user_id = u.id
WHERE n.read = true
AND n.read_at > NOW() - INTERVAL '7 days'
GROUP BY u.id, u.email, u.full_name
ORDER BY last_notification_read DESC
LIMIT 10;

-- ============================================
-- HELPER: Obtener IDs disponibles para pruebas
-- ============================================

-- Obtener usuarios disponibles
SELECT id, email, full_name 
FROM cea.users 
WHERE active = true
LIMIT 5;

-- Obtener tickets recientes
SELECT id, folio, titulo, status
FROM cea.tickets
ORDER BY created_at DESC
LIMIT 5;
