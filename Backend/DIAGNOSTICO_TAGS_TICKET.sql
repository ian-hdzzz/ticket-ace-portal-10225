-- ============================================
-- 🔍 DIAGNÓSTICO: Verificar Tags en Tickets
-- ============================================
-- Ejecutar en Supabase SQL Editor

-- PASO 1: Ver estructura de la columna tags
SELECT 
  column_name,
  data_type,
  udt_name,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'cea'
  AND table_name = 'tickets'
  AND column_name = 'tags';

-- PASO 2: Ver tickets recientes con sus tags
SELECT 
  folio,
  titulo,
  tags,
  pg_typeof(tags) as tipo_tags,
  array_length(tags, 1) as cantidad_tags,
  created_at
FROM cea.tickets
ORDER BY created_at DESC
LIMIT 10;

-- PASO 3: Ver el último ticket creado (el que debería haber enviado email)
SELECT 
  id,
  folio,
  titulo,
  descripcion,
  tags,
  pg_typeof(tags) as tipo_tags,
  CASE 
    WHEN tags IS NULL THEN 'NULL'
    WHEN tags = '{}' THEN 'ARRAY VACÍO'
    WHEN 'necesita_agente' = ANY(tags) THEN 'SÍ TIENE TAG ✅'
    ELSE 'NO TIENE TAG ❌'
  END as tiene_tag_necesita_agente,
  assigned_to,
  created_at
FROM cea.tickets
WHERE folio = 'CEA-URG-251219-0041'  -- El folio del último ticket
LIMIT 1;

-- PASO 4: Contar tickets por tag
SELECT 
  CASE 
    WHEN tags IS NULL THEN 'Sin tags (NULL)'
    WHEN tags = '{}' THEN 'Array vacío'
    WHEN 'necesita_agente' = ANY(tags) THEN 'Con "necesita_agente" ✅'
    ELSE 'Con otros tags'
  END as categoria_tag,
  COUNT(*) as cantidad
FROM cea.tickets
GROUP BY 
  CASE 
    WHEN tags IS NULL THEN 'Sin tags (NULL)'
    WHEN tags = '{}' THEN 'Array vacío'
    WHEN 'necesita_agente' = ANY(tags) THEN 'Con "necesita_agente" ✅'
    ELSE 'Con otros tags'
  END;

-- PASO 5: Ver todos los tags únicos que existen
SELECT DISTINCT unnest(tags) as tag_unico
FROM cea.tickets
WHERE tags IS NOT NULL AND tags <> '{}'
ORDER BY tag_unico;

-- ============================================
-- 🔧 SOLUCIÓN: Si la columna no existe
-- ============================================

-- Si el PASO 1 no devuelve nada, ejecutar:
-- ALTER TABLE cea.tickets ADD COLUMN tags text[] DEFAULT '{}';

-- ============================================
-- 🔧 SOLUCIÓN: Si el ticket no tiene el tag
-- ============================================

-- Agregar tag a ticket específico:
UPDATE cea.tickets
SET tags = array_append(COALESCE(tags, '{}'), 'necesita_agente')
WHERE folio = 'CEA-URG-251219-0041'
  AND NOT ('necesita_agente' = ANY(COALESCE(tags, '{}')));

-- Verificar que se agregó:
SELECT folio, tags 
FROM cea.tickets 
WHERE folio = 'CEA-URG-251219-0041';

-- ============================================
-- 📊 RESULTADO ESPERADO
-- ============================================

/*
PASO 1 debería mostrar:
  column_name | data_type | udt_name
  ------------|-----------|----------
  tags        | ARRAY     | _text

PASO 3 debería mostrar:
  folio                | tags                    | tiene_tag_necesita_agente
  ---------------------|-------------------------|---------------------------
  CEA-URG-251219-0041 | {necesita_agente}       | SÍ TIENE TAG ✅

Si NO tiene el tag, entonces el filtro está funcionando CORRECTAMENTE
y el problema es que el ticket NO se creó con el tag.
*/
