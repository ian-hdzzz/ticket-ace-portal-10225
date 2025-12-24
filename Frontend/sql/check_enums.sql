-- Consultas para verificar los enums de la tabla tickets en Supabase
-- Ejecuta estas consultas en el SQL Editor de tu proyecto Supabase

-- 1. Ver valores permitidos para service_type
SELECT enumlabel as "service_type_values"
FROM pg_enum 
WHERE enumtypid = (
    SELECT oid 
    FROM pg_type 
    WHERE typname = 'service_type'
);

-- 2. Ver valores permitidos para ticket_type  
SELECT enumlabel as "ticket_type_values"
FROM pg_enum 
WHERE enumtypid = (
    SELECT oid 
    FROM pg_type 
    WHERE typname = 'ticket_type'
);

-- 3. Ver valores permitidos para priority (si es enum)
SELECT enumlabel as "priority_values"
FROM pg_enum 
WHERE enumtypid = (
    SELECT oid 
    FROM pg_type 
    WHERE typname = 'priority_level'
);

-- 4. Ver valores permitidos para status
SELECT enumlabel as "status_values"
FROM pg_enum 
WHERE enumtypid = (
    SELECT oid 
    FROM pg_type 
    WHERE typname = 'ticket_status'
);

-- 5. Ver valores permitidos para channel
SELECT enumlabel as "channel_values"
FROM pg_enum 
WHERE enumtypid = (
    SELECT oid 
    FROM pg_type 
    WHERE typname = 'channel_type'
);

-- 6. Ver todos los enums del schema cea
SELECT 
    t.typname AS enum_name, 
    e.enumlabel AS enum_value,
    e.enumsortorder
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
JOIN pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'cea'
ORDER BY t.typname, e.enumsortorder;

-- 7. Ver estructura completa de la tabla tickets
SELECT 
    column_name,
    data_type,
    udt_name,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'cea' 
AND table_name = 'tickets'
ORDER BY ordinal_position;
