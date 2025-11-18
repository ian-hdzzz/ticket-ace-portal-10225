-- Consulta para obtener TODOS los enums necesarios
-- Ejecuta esto en Supabase SQL Editor

-- 1. ticket_type_code values (nombre correcto del enum)
SELECT 'ticket_type_code' as enum_name, enumlabel as enum_value
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ticket_type_code')
UNION ALL

-- 2. priority_level values  
SELECT 'priority_level' as enum_name, enumlabel as enum_value
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'priority_level')
UNION ALL

-- 3. ticket_status values
SELECT 'ticket_status' as enum_name, enumlabel as enum_value
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ticket_status')
UNION ALL

-- 4. channel_type values
SELECT 'channel_type' as enum_name, enumlabel as enum_value
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'channel_type')

ORDER BY enum_name, enum_value;
