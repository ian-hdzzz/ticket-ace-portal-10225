-- RLS Policies for Ticket Management System
-- This file configures Row Level Security policies for the tickets table

-- First, let's check if RLS is enabled
-- If not, enable it:
-- ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow anonymous users to INSERT tickets
CREATE POLICY "Allow anonymous ticket creation" 
ON tickets 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- Policy 2: Allow anonymous users to SELECT tickets
CREATE POLICY "Allow anonymous ticket reading" 
ON tickets 
FOR SELECT 
TO anon 
USING (true);

-- Policy 3: Allow anonymous users to UPDATE tickets
CREATE POLICY "Allow anonymous ticket updates" 
ON tickets 
FOR UPDATE 
TO anon 
USING (true) 
WITH CHECK (true);

-- Optional: More restrictive policies for production
-- You might want to restrict these based on user authentication later

-- Policy for authenticated users (if you implement auth later)
-- CREATE POLICY "Authenticated users full access" 
-- ON tickets 
-- FOR ALL 
-- TO authenticated 
-- USING (true) 
-- WITH CHECK (true);

-- Grant necessary permissions to anonymous role
GRANT SELECT, INSERT, UPDATE ON tickets TO anon;

-- If you have any sequences (for auto-incrementing IDs), grant usage:
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
