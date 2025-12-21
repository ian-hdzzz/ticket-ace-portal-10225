-- ============================================
-- 🔍 VERIFICAR ESTRUCTURA DE TAGS EN TICKETS
-- ============================================

-- PASO 1: Ver si existe columna 'tags' en la tabla tickets
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'cea'
  AND table_name = 'tickets'
  AND column_name = 'tags';

-- PASO 2: Ver tickets con tags (si la columna existe)
SELECT 
  id,
  folio,
  titulo,
  tags,
  assigned_to,
  created_at
FROM cea.tickets
WHERE tags IS NOT NULL
LIMIT 10;

-- PASO 3: Ver TODOS los tickets para entender la estructura
SELECT 
  id,
  folio,
  titulo,
  tags,
  assigned_to,
  created_at
FROM cea.tickets
ORDER BY created_at DESC
LIMIT 5;

-- ============================================
-- 📝 INSTRUCCIONES
-- ============================================

/*
RESULTADO ESPERADO:

Si la columna 'tags' existe como:
  - text[] (array de texto) → Los tags son un array: ["necesita_agente", "urgente"]
  - text (texto simple) → Los tags son un string: "necesita_agente"
  - jsonb → Los tags son JSON: {"tags": ["necesita_agente"]}

Si NO existe la columna 'tags':
  - Necesitamos agregar la columna a la tabla
  - O encontrar otra forma de identificar tickets que necesitan email
*/
