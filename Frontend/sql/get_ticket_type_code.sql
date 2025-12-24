-- Obtener valores específicos de ticket_type_code
SELECT enumlabel as "ticket_type_code_values"
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ticket_type_code')
ORDER BY enumsortorder;
