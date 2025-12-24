-- ============================================
-- SETUP: Notification Webhook Trigger
-- ============================================
-- This trigger sends newly created notifications to the backend
-- Backend will broadcast them via SSE to connected clients

-- ============================================
-- PASO 1: Crear función del trigger
-- ============================================
CREATE OR REPLACE FUNCTION cea.notify_backend_new_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  webhook_url text;
  payload jsonb;
  ticket_data jsonb;
  response_id bigint;
BEGIN
  -- CAMBIAR esta URL según el entorno
  -- Desarrollo (ngrok): 'https://xxxxx.ngrok-free.app/api/notifications/webhook'
  -- Producción: 'https://tu-backend.com/api/notifications/webhook'
  webhook_url := 'https://e3d1240f5af2.ngrok-free.app/api/notifications/webhook';

  RAISE NOTICE '🔔 Trigger de notificación ejecutado para ID: %', NEW.id;

  -- Fetch related ticket (if exists)
  IF NEW.ticket_id IS NOT NULL THEN
    SELECT to_jsonb(t)
    INTO ticket_data
    FROM cea.tickets t
    WHERE t.id = NEW.ticket_id;
    
    RAISE NOTICE '🎫 Ticket encontrado: %', ticket_data->>'folio';
  ELSE
    RAISE NOTICE '⚠️  No hay ticket asociado';
  END IF;

  -- Build enriched payload
  payload := jsonb_build_object(
    'notification', jsonb_build_object(
      'id', NEW.id,
      'user_id', NEW.user_id,
      'type', NEW.type,
      'title', NEW.title,
      'message', NEW.message,
      'read', NEW.read,
      'created_at', NEW.created_at,
      'metadata', NEW.metadata
    ),
    'ticket', ticket_data
  );

  RAISE NOTICE '📦 Enviando payload al backend...';

  -- Send to backend (async)
  SELECT INTO response_id
    net.http_post(
      url := webhook_url,
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := payload
    );

  RAISE NOTICE '✅ Webhook llamado (Response ID: %)', response_id;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the insert
  RAISE WARNING '❌ Error en trigger notify_backend_new_notification: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- ============================================
-- PASO 2: Crear el trigger (si no existe)
-- ============================================
DROP TRIGGER IF EXISTS on_notification_created ON cea.notifications;

CREATE TRIGGER on_notification_created
  AFTER INSERT ON cea.notifications
  FOR EACH ROW
  EXECUTE FUNCTION cea.notify_backend_new_notification();

-- ============================================
-- PASO 3: Verificar instalación
-- ============================================
SELECT 
  t.tgname as "Trigger",
  CASE t.tgenabled::text
    WHEN 'O' THEN 'ACTIVO ✅'
    WHEN 'D' THEN 'DESACTIVADO ❌'
    ELSE 'Estado: ' || t.tgenabled::text
  END as "Estado",
  c.relname as "Tabla",
  p.proname as "Función"
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgname = 'on_notification_created';

-- ============================================
-- PRUEBA: Crear una notificación de prueba
-- ============================================
/*
-- Primero, obtén un user_id válido
SELECT id, email FROM auth.users LIMIT 1;

-- Luego crea una notificación de prueba
INSERT INTO cea.notifications (user_id, type, title, message, metadata)
VALUES (
  'tu-user-id-aqui',
  'SYSTEM_ALERT',
  'Prueba de notificación',
  'Esta es una notificación de prueba del trigger',
  '{"test": true}'::jsonb
);

-- Verifica en los logs del backend que el webhook fue llamado
*/

