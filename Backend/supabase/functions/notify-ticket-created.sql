-- ============================================
-- FUNCIÓN Y TRIGGER PARA ENVIAR EMAILS AUTOMÁTICOS
-- Cuando se crea un nuevo ticket en Supabase
-- ============================================

-- 1. Crear la función que se ejecutará cuando se inserte un ticket
CREATE OR REPLACE FUNCTION notify_ticket_created()
RETURNS TRIGGER AS $$
DECLARE
  user_email_var text;
  user_name_var text;
  webhook_url text;
  payload json;
BEGIN
  -- URL del webhook en tu backend
  -- ⚠️ CAMBIAR ESTO EN PRODUCCIÓN
  webhook_url := 'http://localhost:3000/api/email/webhook/ticket-created';
  -- webhook_url := 'https://tu-dominio.com/api/email/webhook/ticket-created';

  -- Obtener el email del usuario que creó el ticket
  -- Ajusta esto según tu estructura de base de datos
  
  -- Opción 1: Si tienes el user_id en el ticket
  IF NEW.created_by IS NOT NULL THEN
    SELECT email, full_name INTO user_email_var, user_name_var
    FROM auth.users
    WHERE id = NEW.created_by::uuid;
  END IF;

  -- Opción 2: Si no hay user_id, buscar por customer_id
  IF user_email_var IS NULL AND NEW.customer_id IS NOT NULL THEN
    SELECT email, name INTO user_email_var, user_name_var
    FROM customers
    WHERE id = NEW.customer_id;
  END IF;

  -- Opción 3: Si no hay nada, usar un email por defecto o salir
  IF user_email_var IS NULL THEN
    -- Puedes usar un email por defecto o simplemente no enviar
    RAISE NOTICE 'No se encontró email para el ticket %, no se enviará notificación', NEW.id;
    RETURN NEW;
  END IF;

  -- Construir el payload JSON
  payload := json_build_object(
    'record', row_to_json(NEW),
    'user_email', user_email_var,
    'user_name', COALESCE(user_name_var, user_email_var)
  );

  -- Llamar al webhook usando pg_net (extensión de Supabase)
  -- Nota: pg_net es asíncrono, no bloquea la inserción
  PERFORM
    net.http_post(
      url := webhook_url,
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := payload::jsonb
    );

  RAISE NOTICE 'Webhook llamado para ticket % - Email: %', NEW.id, user_email_var;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Crear el trigger que ejecuta la función
DROP TRIGGER IF EXISTS on_ticket_created ON tickets;

CREATE TRIGGER on_ticket_created
  AFTER INSERT ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION notify_ticket_created();

-- 3. Comentarios de la función
COMMENT ON FUNCTION notify_ticket_created() IS 'Envía un email automático cuando se crea un nuevo ticket';
COMMENT ON TRIGGER on_ticket_created ON tickets IS 'Trigger que llama a notify_ticket_created() después de insertar un ticket';

-- ============================================
-- HABILITAR LA EXTENSIÓN pg_net SI NO ESTÁ HABILITADA
-- ============================================
-- Ejecuta esto en el SQL Editor de Supabase Dashboard si es necesario:
-- CREATE EXTENSION IF NOT EXISTS pg_net;

-- ============================================
-- INSTRUCCIONES DE USO
-- ============================================
-- 1. Ejecuta este script en el SQL Editor de Supabase Dashboard
-- 2. Asegúrate de que la extensión pg_net esté habilitada
-- 3. Cambia la URL del webhook en producción
-- 4. Ajusta la lógica de obtención del email según tu estructura de DB

-- Para probar, inserta un ticket:
-- INSERT INTO tickets (descripcion, priority, status, channel, created_by)
-- VALUES ('Prueba de email automático', 'media', 'abierto', 'web', 'user-uuid-aqui');

-- Para ver los logs:
-- SELECT * FROM pg_stat_statements WHERE query LIKE '%notify_ticket_created%';

-- Para desactivar el trigger temporalmente:
-- ALTER TABLE tickets DISABLE TRIGGER on_ticket_created;

-- Para reactivar el trigger:
-- ALTER TABLE tickets ENABLE TRIGGER on_ticket_created;
