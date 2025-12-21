-- ============================================
-- 🏷️ AGREGAR COLUMNA TAGS A TABLA TICKETS
-- ============================================
-- Ejecutar este script en Supabase SQL Editor

-- OPCIÓN 1: Tags como array de texto (RECOMENDADO)
-- Permite múltiples tags: ["necesita_agente", "urgente", "vip"]
-- ============================================

-- Verificar si la columna ya existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'cea' 
      AND table_name = 'tickets' 
      AND column_name = 'tags'
  ) THEN
    -- Agregar columna tags como array de texto
    ALTER TABLE cea.tickets 
    ADD COLUMN tags text[] DEFAULT '{}';
    
    RAISE NOTICE '✅ Columna tags agregada como text[]';
  ELSE
    RAISE NOTICE '⚠️  Columna tags ya existe';
  END IF;
END $$;

-- ============================================
-- 🔧 FUNCIONES AUXILIARES OPCIONALES
-- ============================================

-- Función para agregar un tag a un ticket
CREATE OR REPLACE FUNCTION cea.add_tag_to_ticket(
  ticket_id uuid,
  tag_name text
)
RETURNS void AS $$
BEGIN
  UPDATE cea.tickets
  SET tags = array_append(tags, tag_name)
  WHERE id = ticket_id
    AND NOT (tag_name = ANY(tags));
END;
$$ LANGUAGE plpgsql;

-- Función para remover un tag de un ticket
CREATE OR REPLACE FUNCTION cea.remove_tag_from_ticket(
  ticket_id uuid,
  tag_name text
)
RETURNS void AS $$
BEGIN
  UPDATE cea.tickets
  SET tags = array_remove(tags, tag_name)
  WHERE id = ticket_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 🧪 EJEMPLOS DE USO
-- ============================================

/*
-- Crear ticket con tag "necesita_agente"
INSERT INTO cea.tickets (
  folio,
  titulo,
  descripcion,
  assigned_to,
  priority,
  status,
  channel,
  tags  -- 🏷️ Agregar tags aquí
) VALUES (
  'TKT-001',
  'Problema urgente',
  'Cliente necesita ayuda',
  'uuid-del-asesor',
  'high',
  'open',
  'telefono',
  ARRAY['necesita_agente', 'urgente']  -- Array de tags
);

-- Actualizar ticket existente para agregar tag
UPDATE cea.tickets
SET tags = ARRAY['necesita_agente']
WHERE folio = 'TKT-001';

-- Agregar tag usando función auxiliar
SELECT cea.add_tag_to_ticket(
  'uuid-del-ticket',
  'necesita_agente'
);

-- Verificar tickets con tag "necesita_agente"
SELECT id, folio, titulo, tags
FROM cea.tickets
WHERE 'necesita_agente' = ANY(tags);
*/

-- ============================================
-- ✅ VERIFICACIÓN
-- ============================================

-- Ver estructura de la columna tags
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'cea'
  AND table_name = 'tickets'
  AND column_name = 'tags';

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Script ejecutado exitosamente';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Columna tags configurada';
  RAISE NOTICE '🏷️  Tipo: text[] (array de texto)';
  RAISE NOTICE '';
  RAISE NOTICE '💡 PRÓXIMOS PASOS:';
  RAISE NOTICE '1. Crear tickets con tags = ARRAY[''necesita_agente'']';
  RAISE NOTICE '2. El webhook filtrará automáticamente';
  RAISE NOTICE '3. Solo se enviarán emails a tickets con ese tag';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
END $$;
