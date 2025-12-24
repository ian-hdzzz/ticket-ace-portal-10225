-- ============================================
-- CREAR TABLA DE NOTIFICACIONES EN SUPABASE
-- ============================================
-- Ejecutar estos queries en el SQL Editor de Supabase

-- 1. Primero crear el ENUM para los tipos de notificación
CREATE TYPE cea."NotificationType" AS ENUM (
  'TICKET_CREATED',
  'TICKET_ASSIGNED',
  'TICKET_STATUS_CHANGED',
  'TICKET_PRIORITY_CHANGED',
  'TICKET_COMMENT',
  'SYSTEM_ALERT'
);

-- 2. Crear la tabla de notificaciones
CREATE TABLE cea.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type cea."NotificationType" NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    ticket_id UUID,
    read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMPTZ,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_notifications_user 
        FOREIGN KEY (user_id) 
        REFERENCES cea.users(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_notifications_ticket 
        FOREIGN KEY (ticket_id) 
        REFERENCES cea.tickets(id) 
        ON DELETE CASCADE
);

-- 3. Crear índices para mejorar el rendimiento
CREATE INDEX idx_notifications_user_id ON cea.notifications(user_id);
CREATE INDEX idx_notifications_user_read ON cea.notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON cea.notifications(created_at);

-- 4. Comentarios en la tabla (opcional pero recomendado)
COMMENT ON TABLE cea.notifications IS 'Tabla de notificaciones para usuarios del sistema';
COMMENT ON COLUMN cea.notifications.user_id IS 'ID del usuario que recibe la notificación';
COMMENT ON COLUMN cea.notifications.type IS 'Tipo de notificación (creación de ticket, asignación, etc.)';
COMMENT ON COLUMN cea.notifications.title IS 'Título de la notificación';
COMMENT ON COLUMN cea.notifications.message IS 'Mensaje de la notificación';
COMMENT ON COLUMN cea.notifications.ticket_id IS 'ID del ticket relacionado (opcional)';
COMMENT ON COLUMN cea.notifications.read IS 'Indica si la notificación ha sido leída';
COMMENT ON COLUMN cea.notifications.read_at IS 'Fecha y hora en que se leyó la notificación';
COMMENT ON COLUMN cea.notifications.metadata IS 'Información adicional en formato JSON';

-- 5. Habilitar Row Level Security (RLS) - Seguridad a nivel de fila
ALTER TABLE cea.notifications ENABLE ROW LEVEL SECURITY;

-- 6. Crear políticas RLS para que los usuarios solo vean sus propias notificaciones
-- Política de SELECT: Los usuarios solo pueden ver sus propias notificaciones
CREATE POLICY "Users can view their own notifications"
    ON cea.notifications
    FOR SELECT
    USING (auth.uid()::text = user_id::text);

-- Política de UPDATE: Los usuarios solo pueden actualizar sus propias notificaciones
CREATE POLICY "Users can update their own notifications"
    ON cea.notifications
    FOR UPDATE
    USING (auth.uid()::text = user_id::text);

-- Política de DELETE: Los usuarios solo pueden eliminar sus propias notificaciones
CREATE POLICY "Users can delete their own notifications"
    ON cea.notifications
    FOR DELETE
    USING (auth.uid()::text = user_id::text);

-- Política de INSERT: El sistema puede insertar notificaciones para cualquier usuario
-- (esto se hace desde el backend con service_role key)
CREATE POLICY "System can insert notifications"
    ON cea.notifications
    FOR INSERT
    WITH CHECK (true);

-- ============================================
-- OPCIONAL: Función para limpiar notificaciones antiguas
-- ============================================
-- Esta función elimina notificaciones leídas con más de 30 días
CREATE OR REPLACE FUNCTION cea.cleanup_old_notifications()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM cea.notifications
    WHERE read = true 
    AND read_at < NOW() - INTERVAL '30 days';
END;
$$;

-- ============================================
-- VERIFICAR LA CREACIÓN
-- ============================================
-- Ejecuta este query para verificar que todo se creó correctamente
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'cea' 
AND table_name = 'notifications'
ORDER BY ordinal_position;

-- Ver los índices creados
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'cea' AND tablename = 'notifications';

-- Ver las políticas RLS creadas
SELECT policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'cea' AND tablename = 'notifications';
