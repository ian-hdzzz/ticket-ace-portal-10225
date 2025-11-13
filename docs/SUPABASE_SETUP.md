# Supabase Setup Guide

This guide explains how to set up Supabase for production mode.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. A Supabase project created

## Database Schema

Create the following tables in your Supabase project:

### Tickets Table

```sql
CREATE TABLE tickets (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  agent_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Create index for faster queries
CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_agent_id ON tickets(agent_id);
```

### Agents Table

```sql
CREATE TABLE agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('voice', 'chat')),
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
  model TEXT,
  voice TEXT,
  system_prompt TEXT,
  assignment_rules TEXT,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agents_type ON agents(type);
```

## Row Level Security (RLS)

For production, you should configure Row Level Security policies. Here are example policies:

### Tickets RLS Policies

```sql
-- Enable RLS
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (adjust based on your auth setup)
CREATE POLICY "Allow all for authenticated users" ON tickets
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Or allow public read/write (for demo purposes only)
CREATE POLICY "Allow public access" ON tickets
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

### Agents RLS Policies

```sql
-- Enable RLS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users
CREATE POLICY "Allow all for authenticated users" ON agents
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Or allow public access (for demo purposes only)
CREATE POLICY "Allow public access" ON agents
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

## Environment Variables

1. Copy `env.example` to `.env`:
   ```bash
   cp env.example .env
   ```

2. Update `.env` with your Supabase credentials:
   ```env
   VITE_APP_MODE=production
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. Get your Supabase credentials:
   - Go to your Supabase project dashboard
   - Navigate to Settings > API
   - Copy the "Project URL" and "anon public" key

## Seeding Data (Optional)

You can seed your database with initial data using the Supabase SQL editor:

```sql
-- Insert sample tickets
INSERT INTO tickets (id, title, description, status, priority, agent_id, created_at) VALUES
  ('1', 'Fuga de agua en Av. Constituyentes', 'Reporte de fuga importante en la zona centro, requiere atención inmediata', 'open', 'urgent', NULL, NOW() - INTERVAL '2 hours'),
  ('2', 'Baja presión de agua', 'Vecinos reportan baja presión en Col. Jardines', 'in_progress', 'high', '1', NOW() - INTERVAL '5 hours'),
  ('3', 'Solicitud de nuevo medidor', 'Cliente solicita instalación de medidor en nueva construcción', 'resolved', 'medium', '2', NOW() - INTERVAL '24 hours');

-- Insert sample agents
INSERT INTO agents (id, name, type, status, model, voice, system_prompt, assignment_rules, last_updated) VALUES
  ('1', 'Juan Pérez', 'chat', 'active', 'gpt-4', NULL, 'Eres un agente de tickets...', 'Tickets urgentes y de alta prioridad', NOW()),
  ('2', 'María González', 'chat', 'active', 'gpt-3.5-turbo', NULL, 'Eres un agente de tickets...', 'Tickets relacionados con facturación', NOW());
```

## Testing

1. Set `VITE_APP_MODE=production` in your `.env` file
2. Restart your development server
3. The application should now connect to Supabase instead of using mock data

## Troubleshooting

### "Supabase client not available" error

- Check that `VITE_APP_MODE=production` is set
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Ensure your Supabase project is active

### RLS Policy Errors

- Check that Row Level Security policies are configured correctly
- For testing, you can temporarily disable RLS: `ALTER TABLE tickets DISABLE ROW LEVEL SECURITY;`

### Connection Errors

- Verify your Supabase project URL is correct
- Check that your project is not paused
- Ensure your network allows connections to Supabase

