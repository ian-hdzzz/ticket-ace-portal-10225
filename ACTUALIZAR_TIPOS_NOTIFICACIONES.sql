-- 🔄 ACTUALIZAR TIPOS DE NOTIFICACIONES
-- Este script cambia el sistema de 6 tipos a solo 2 tipos

-- PASO 1: Eliminar el enum antiguo y crear uno nuevo
-- ⚠️ IMPORTANTE: Esto eliminará las notificaciones existentes

-- Opción A: Eliminar notificaciones antiguas y recrear el enum
DROP TABLE IF EXISTS cea.notifications CASCADE;

-- Eliminar el enum antiguo
DROP TYPE IF EXISTS cea."NotificationType" CASCADE;

-- Crear el nuevo enum con solo 2 tipos
CREATE TYPE cea."NotificationType" AS ENUM (
  'TICKET_QUEUE',      -- Cliente en cola esperando asesor  
  'TICKET_ASSIGNED'    -- Ticket asignado específicamente al usuario
);

-- Recrear la tabla de notificaciones
CREATE TABLE cea.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES cea.users(id) ON DELETE CASCADE,
  type cea."NotificationType" NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  ticket_id UUID REFERENCES cea.tickets(id) ON DELETE CASCADE,
  read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Recrear índices
CREATE INDEX idx_notifications_user_id ON cea.notifications(user_id);
CREATE INDEX idx_notifications_user_read ON cea.notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON cea.notifications(created_at);

-- Políticas RLS (Row Level Security)
ALTER TABLE cea.notifications ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propias notificaciones
CREATE POLICY "Users can view own notifications" 
  ON cea.notifications FOR SELECT 
  USING (auth.uid()::text = user_id::text);

-- Política: Los usuarios pueden actualizar sus propias notificaciones
CREATE POLICY "Users can update own notifications" 
  ON cea.notifications FOR UPDATE 
  USING (auth.uid()::text = user_id::text);

-- Política: Los usuarios pueden eliminar sus propias notificaciones
CREATE POLICY "Users can delete own notifications" 
  ON cea.notifications FOR DELETE 
  USING (auth.uid()::text = user_id::text);

-- Política: Permitir inserts desde funciones (webhooks)
CREATE POLICY "Allow service role to insert notifications" 
  ON cea.notifications FOR INSERT 
  WITH CHECK (true);

-- ✅ LISTO! Ahora ejecuta en tu terminal del backend:
-- cd Backend
-- npx prisma generate
-- npm run dev (o bun run dev)

-- 📝 NOTAS:
-- - TICKET_QUEUE: Se crea cuando un ticket tiene el tag "necesita_agente"
-- - TICKET_ASSIGNED: Se usará en el futuro cuando se implemente asignación directa

COMMENT ON TYPE cea."NotificationType" IS 'Tipos de notificaciones: TICKET_QUEUE (en cola) y TICKET_ASSIGNED (asignado)';
