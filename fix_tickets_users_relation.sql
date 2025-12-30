-- Fix: Agregar foreign key constraints para assigned_to y escalated_to en tickets
-- Estas queries agregan las relaciones que faltan entre tickets y users

-- 1. Foreign key para assigned_to
ALTER TABLE cea.tickets 
ADD CONSTRAINT tickets_assigned_to_fkey 
FOREIGN KEY (assigned_to) 
REFERENCES cea.users (id) 
ON DELETE SET NULL;

-- 2. Foreign key para escalated_to (si es que también debe apuntar a users)
ALTER TABLE cea.tickets 
ADD CONSTRAINT tickets_escalated_to_fkey 
FOREIGN KEY (escalated_to) 
REFERENCES cea.users (id) 
ON DELETE SET NULL;

-- Verificar que las constraints se crearon correctamente
SELECT conname, contype, confrelid::regclass as referenced_table
FROM pg_constraint 
WHERE conrelid = 'cea.tickets'::regclass 
AND conname IN ('tickets_assigned_to_fkey', 'tickets_escalated_to_fkey');

-- Verificar las relaciones en Supabase
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name='tickets'
  AND tc.table_schema='cea';
