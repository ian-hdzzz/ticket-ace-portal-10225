-- Check current RLS status and policies
-- Run these queries in your Supabase SQL editor to diagnose the issue

-- 1. Check if RLS is enabled on the tickets table
SELECT schemaname, tablename, rowsecurity, hasoids 
FROM pg_tables 
WHERE tablename = 'tickets';

-- 2. Check existing policies on tickets table
SELECT * FROM pg_policies WHERE tablename = 'tickets';

-- 3. Check table permissions for anon role
SELECT table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE grantee = 'anon' AND table_name = 'tickets';

-- 4. Check if table exists and basic info
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'tickets'
ORDER BY ordinal_position;
