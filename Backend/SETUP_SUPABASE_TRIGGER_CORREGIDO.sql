-- ============================================
-- 🔧 TRIGGER CORREGIDO - Para tu tabla real
-- ============================================
-- Ejecuta TODO este archivo en Supabase SQL Editor

-- ============================================
-- PASO 1: Habilitar extensión pg_net
-- ============================================

CREATE EXTENSION IF NOT EXISTS pg_net;

-- ============================================
-- PASO 2: ELIMINAR trigger anterior (si existe)
-- ============================================

DROP TRIGGER IF EXISTS on_ticket_created ON cea.tickets;
DROP FUNCTION IF EXISTS notify_ticket_created();

-- ============================================
-- PASO 3: Crear NUEVA función adaptada a tu tabla
-- ============================================

CREATE OR REPLACE FUNCTION notify_ticket_created()
RETURNS TRIGGER AS $$
DECLARE
  user_email_var text;
  user_name_var text;
  webhook_url text;
  payload jsonb;
  response_id bigint;
BEGIN
  -- URL del webhook (CAMBIAR en producción)
  webhook_url := 'https://818e41e69f97.ngrok-free.app/api/email/webhook/ticket-created';

  RAISE NOTICE '🔔 Trigger ejecutado para ticket ID: %', NEW.id;
  RAISE NOTICE '📋 Folio: %, customer_id: %, assigned_to: %', NEW.folio, NEW.customer_id, NEW.assigned_to;

  -- ESTRATEGIA 1: Buscar por customer_id
  IF NEW.customer_id IS NOT NULL THEN
    BEGIN
      -- Buscar en auth.users si customer_id es un UUID
      SELECT 
        email, 
        COALESCE(raw_user_meta_data->>'full_name', email) 
      INTO 
        user_email_var, 
        user_name_var
      FROM auth.users
      WHERE id = NEW.customer_id;
      
      IF user_email_var IS NOT NULL THEN
        RAISE NOTICE '✅ Email encontrado via customer_id: %', user_email_var;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '⚠️  Error al buscar customer_id en auth.users: %', SQLERRM;
    END;
  END IF;

  -- ESTRATEGIA 2: Si no se encontró, buscar por assigned_to
  IF user_email_var IS NULL AND NEW.assigned_to IS NOT NULL THEN
    BEGIN
      SELECT 
        email, 
        COALESCE(raw_user_meta_data->>'full_name', email) 
      INTO 
        user_email_var, 
        user_name_var
      FROM auth.users
      WHERE id = NEW.assigned_to;
      
      IF user_email_var IS NOT NULL THEN
        RAISE NOTICE '✅ Email encontrado via assigned_to: %', user_email_var;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '⚠️  Error al buscar assigned_to: %', SQLERRM;
    END;
  END IF;

  -- ESTRATEGIA 3: Si existe tabla customers, buscar ahí
  IF user_email_var IS NULL AND NEW.customer_id IS NOT NULL THEN
    BEGIN
      SELECT email, name 
      INTO user_email_var, user_name_var
      FROM customers
      WHERE id = NEW.customer_id;
      
      IF user_email_var IS NOT NULL THEN
        RAISE NOTICE '✅ Email encontrado en tabla customers: %', user_email_var;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '⚠️  Tabla customers no existe o error: %', SQLERRM;
    END;
  END IF;

  -- Si no se encontró email, usar uno por defecto para desarrollo
  IF user_email_var IS NULL THEN
    RAISE NOTICE '⚠️  No se encontró email, usando email por defecto';
    user_email_var := 'ianhdez2020@gmail.com';  -- Tu email para desarrollo
    user_name_var := 'Usuario CEA';
  END IF;

  -- Construir el payload JSON
  payload := jsonb_build_object(
    'record', row_to_json(NEW)::jsonb,
    'user_email', user_email_var,
    'user_name', COALESCE(user_name_var, user_email_var)
  );

  RAISE NOTICE '📦 Payload construido, enviando a webhook...';
  RAISE NOTICE '📧 Email destino: %, Nombre: %', user_email_var, user_name_var;

  -- Llamar al webhook (asíncrono)
  SELECT INTO response_id
    net.http_post(
      url := webhook_url,
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := payload
    );

  RAISE NOTICE '✅ Webhook llamado (Response ID: %)', response_id;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Si hay error, loguearlo pero NO fallar la inserción del ticket
  RAISE WARNING '❌ Error en trigger notify_ticket_created: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PASO 4: Crear el trigger
-- ============================================

CREATE TRIGGER on_ticket_created
  AFTER INSERT ON cea.tickets
  FOR EACH ROW
  EXECUTE FUNCTION notify_ticket_created();

-- ============================================
-- PASO 5: Verificar instalación
-- ============================================

-- Ver trigger creado
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
WHERE t.tgname = 'on_ticket_created';

-- ============================================
-- 📝 NOTAS IMPORTANTES
-- ============================================

/*
✅ CAMBIOS REALIZADOS:

1. ❌ ELIMINADO: Búsqueda por created_by (no existe)
2. ✅ AGREGADO: Búsqueda por customer_id
3. ✅ AGREGADO: Búsqueda por assigned_to como fallback
4. ✅ AGREGADO: Email por defecto si no se encuentra ninguno

📧 FLUJO DE BÚSQUEDA DE EMAIL:

1. Intenta customer_id → auth.users
2. Si falla, intenta assigned_to → auth.users
3. Si falla, intenta customer_id → tabla customers
4. Si todo falla, usa: ianhdez2020@gmail.com

🧪 PARA PROBAR:

-- Opción A: Ticket con customer_id
INSERT INTO cea.tickets (
  titulo,
  descripcion,
  priority,
  status,
  channel,
  customer_id
) VALUES (
  'PRUEBA EMAIL ' || NOW()::text,
  'Verificando emails automáticos',
  'Alta',
  'abierto',
  'web',
  (SELECT id FROM auth.users LIMIT 1)
) RETURNING *;

-- Opción B: Ticket con assigned_to
INSERT INTO cea.tickets (
  titulo,
  descripcion,
  priority,
  status,
  channel,
  assigned_to
) VALUES (
  'PRUEBA EMAIL ' || NOW()::text,
  'Verificando emails automáticos',
  'Alta',
  'abierto',
  'web',
  (SELECT id FROM auth.users LIMIT 1)
) RETURNING *;

-- Opción C: Ticket sin usuario (usará email por defecto)
INSERT INTO cea.tickets (
  titulo,
  descripcion,
  priority,
  status,
  channel
) VALUES (
  'PRUEBA EMAIL ' || NOW()::text,
  'Verificando emails automáticos',
  'Alta',
  'abierto',
  'web'
) RETURNING *;

🔍 VER LOGS:

-- Ver llamadas HTTP
SELECT 
  id,
  created,
  status_code,
  error_msg
FROM net._http_response
ORDER BY created DESC
LIMIT 5;

-- Ver logs de Postgres
-- Ve a: Supabase Dashboard → Logs → Postgres Logs
-- Busca los mensajes RAISE NOTICE

⚙️  PARA PRODUCCIÓN:

1. Cambia webhook_url (línea 25) a:
   'https://ticket-ace-portal-10225.onrender.com/api/email/webhook/ticket-created'

2. Elimina el email por defecto (línea 82-84) o cambia la lógica:
   IF user_email_var IS NULL THEN
     RAISE NOTICE '⚠️  No se encontró email, no se enviará notificación';
     RETURN NEW;
   END IF;
*/
