-- ============================================================================
-- Data Export Queries for Supabase Migration
-- ============================================================================
-- Run these queries in Supabase SQL Editor and export results to CSV
-- Save CSV files in Backend/prisma/data/ directory
-- ============================================================================

-- IMPORTANT: Export tables in this order to respect foreign key dependencies
-- when importing later

-- ============================================================================
-- 1. TABLES WITH NO DEPENDENCIES (export first)
-- ============================================================================

-- Export customers (REQUIRED - has data)
SELECT * FROM cea.customers;
-- Save as: customers.csv

-- Export media_assets (currently empty, but export if you have data)
SELECT * FROM cea.media_assets;
-- Save as: media_assets.csv

-- Export sla_config (currently empty, but needed for SLA triggers)
SELECT * FROM cea.sla_config;
-- Save as: sla_config.csv

-- Export ticket_templates (currently empty)
SELECT * FROM cea.ticket_templates;
-- Save as: ticket_templates.csv

-- Export canned_responses (currently empty)
SELECT * FROM cea.canned_responses;
-- Save as: canned_responses.csv

-- Export n8n_chat_historial_bot (has data)
SELECT * FROM cea.n8n_chat_historial_bot;
-- Save as: n8n_chat_historial_bot.csv

-- ============================================================================
-- 2. TABLES THAT DEPEND ON CUSTOMERS (export second)
-- ============================================================================

-- Export tickets (REQUIRED - has data)
SELECT * FROM cea.tickets;
-- Save as: tickets.csv

-- ============================================================================
-- 3. TABLES THAT DEPEND ON TICKETS AND/OR CUSTOMERS (export last)
-- ============================================================================

-- Export meter_readings (currently empty)
-- IMPORTANT: Do NOT export the computed column 'consumo_m3'
SELECT 
  id, ticket_id, customer_id, lectura_anterior, lectura_actual,
  fecha_lectura, foto_url, validado, observaciones, created_at, media_id
FROM cea.meter_readings;
-- Save as: meter_readings.csv

-- Export customer_media (currently empty)
SELECT * FROM cea.customer_media;
-- Save as: customer_media.csv

-- Export ticket_media (currently empty)
SELECT * FROM cea.ticket_media;
-- Save as: ticket_media.csv

-- Export ticket_conversations (currently empty)
SELECT * FROM cea.ticket_conversations;
-- Save as: ticket_conversations.csv

-- Export ticket_clarifications (currently empty)
SELECT * FROM cea.ticket_clarifications;
-- Save as: ticket_clarifications.csv

-- Export ticket_leaks (currently empty)
SELECT * FROM cea.ticket_leaks;
-- Save as: ticket_leaks.csv

-- Export payment_records (currently empty)
SELECT * FROM cea.payment_records;
-- Save as: payment_records.csv

-- Export contract_changes (currently empty)
SELECT * FROM cea.contract_changes;
-- Save as: contract_changes.csv

-- ============================================================================
-- 4. AUTH TABLES (only if you're migrating users/roles)
-- ============================================================================
-- Note: You mentioned you already have these, so you might skip this section

-- Export users
SELECT * FROM cea.users;
-- Save as: users.csv

-- Export roles
SELECT * FROM cea.roles;
-- Save as: roles.csv

-- Export privileges
SELECT * FROM cea.privileges;
-- Save as: privileges.csv

-- Export users_roles
SELECT * FROM cea.users_roles;
-- Save as: users_roles.csv

-- Export roles_privileges
SELECT * FROM cea.roles_privileges;
-- Save as: roles_privileges.csv

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to see which tables actually have data before exporting

SELECT 'customers' as table_name, COUNT(*) as row_count FROM cea.customers
UNION ALL
SELECT 'tickets', COUNT(*) FROM cea.tickets
UNION ALL
SELECT 'meter_readings', COUNT(*) FROM cea.meter_readings
UNION ALL
SELECT 'customer_media', COUNT(*) FROM cea.customer_media
UNION ALL
SELECT 'media_assets', COUNT(*) FROM cea.media_assets
UNION ALL
SELECT 'ticket_clarifications', COUNT(*) FROM cea.ticket_clarifications
UNION ALL
SELECT 'ticket_leaks', COUNT(*) FROM cea.ticket_leaks
UNION ALL
SELECT 'payment_records', COUNT(*) FROM cea.payment_records
UNION ALL
SELECT 'contract_changes', COUNT(*) FROM cea.contract_changes
UNION ALL
SELECT 'sla_config', COUNT(*) FROM cea.sla_config
UNION ALL
SELECT 'ticket_templates', COUNT(*) FROM cea.ticket_templates
UNION ALL
SELECT 'canned_responses', COUNT(*) FROM cea.canned_responses
UNION ALL
SELECT 'ticket_conversations', COUNT(*) FROM cea.ticket_conversations
UNION ALL
SELECT 'ticket_media', COUNT(*) FROM cea.ticket_media
UNION ALL
SELECT 'n8n_chat_historial_bot', COUNT(*) FROM cea.n8n_chat_historial_bot
ORDER BY row_count DESC;

-- ============================================================================
-- NOTES
-- ============================================================================
-- 
-- 1. Always export tables with data first (customers, tickets, n8n_chat_historial_bot)
-- 2. For meter_readings, exclude the computed column 'consumo_m3'
-- 3. Make sure to preserve NULL values in CSV exports
-- 4. Preserve array and JSONB fields as JSON strings
-- 5. Keep UUID format intact
-- 6. Preserve timestamp timezone information
-- 
-- ============================================================================

