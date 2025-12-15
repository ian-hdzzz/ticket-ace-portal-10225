-- ============================================================================
-- Database Views Migration
-- ============================================================================
-- These views provide aggregated/computed data from the base tables.
-- They are marked as @@ignore in Prisma but exist in the database.
-- Run this after importing your data.
-- ============================================================================

-- ============================================================================
-- 1. v_ticket_dashboard
-- ============================================================================
-- Provides a dashboard view of tickets with related customer info and metrics
-- ============================================================================

CREATE OR REPLACE VIEW public.v_ticket_dashboard AS
SELECT
  t.id,
  t.folio,
  t.status,
  t.priority,
  t.service_type,
  t.titulo,
  c.nombre_titular,
  c.numero_contrato,
  t.created_at,
  t.sla_deadline,
  CASE
    WHEN t.sla_deadline < CURRENT_TIMESTAMP
    AND t.status NOT IN ('resuelto', 'cerrado')
    THEN true
    ELSE false
  END as sla_breached,
  t.assigned_to,
  COUNT(tc.id) as message_count
FROM public.tickets t
LEFT JOIN public.customers c ON t.customer_id = c.id
LEFT JOIN public.ticket_conversations tc ON t.id = tc.ticket_id
GROUP BY
  t.id,
  c.nombre_titular,
  c.numero_contrato;

-- ============================================================================
-- 2. v_ticket_statistics
-- ============================================================================
-- Provides daily statistics aggregated by service_type
-- ============================================================================

CREATE OR REPLACE VIEW public.v_ticket_statistics AS
SELECT
  DATE(created_at) as fecha,
  service_type,
  COUNT(*) as total_tickets,
  COUNT(*) FILTER (WHERE status = 'resuelto') as resolved_tickets,
  COUNT(*) FILTER (WHERE status = 'abierto') as open_tickets,
  COUNT(*) FILTER (WHERE priority = 'urgente') as urgent_tickets,
  CAST(
    AVG(EXTRACT(epoch FROM resolved_at - created_at) / 60) 
    AS INTEGER
  ) as avg_resolution_minutes
FROM public.tickets
GROUP BY DATE(created_at), service_type;

-- ============================================================================
-- 3. user_permissions_view
-- ============================================================================
-- Flattened view of user permissions (one row per user-privilege combo)
-- ============================================================================

CREATE OR REPLACE VIEW public.user_permissions_view AS
SELECT
  u.id as user_id,
  u."fullName" as full_name,
  u.email,
  r.id as role_id,
  r.name as role_name,
  p.id as privilege_id,
  p.name as privilege_name,
  p.module as privilege_module
FROM public.users u
JOIN public.users_roles ur ON u.id = ur."userId"
JOIN public.roles r ON ur."roleId" = r.id
JOIN public.roles_privileges rp ON r.id = rp."roleId"
JOIN public.privileges p ON rp."privilegeId" = p.id
WHERE u.active = true
  AND r.active = true;

-- ============================================================================
-- 4. user_privileges
-- ============================================================================
-- Detailed view of user privileges with description
-- ============================================================================

CREATE OR REPLACE VIEW public.user_privileges AS
SELECT
  u.id as user_id,
  u."fullName" as full_name,
  u.email,
  r.id as role_id,
  r.name as role_name,
  p.id as privilege_id,
  p.name as privilege_name,
  p.module as privilege_module,
  p.description as privilege_description
FROM public.users u
JOIN public.users_roles ur ON u.id = ur."userId"
JOIN public.roles r ON ur."roleId" = r.id
JOIN public.roles_privileges rp ON r.id = rp."roleId"
JOIN public.privileges p ON rp."privilegeId" = p.id
WHERE u.active = true
  AND r.active = true;

-- ============================================================================
-- 5. user_privileges_summary
-- ============================================================================
-- Aggregated view with all roles and privileges per user as JSON arrays
-- ============================================================================

CREATE OR REPLACE VIEW public.user_privileges_summary AS
SELECT
  u.id as user_id,
  u."fullName" as full_name,
  u.email,
  json_agg(DISTINCT r.name) as roles,
  json_agg(DISTINCT p.name) as privileges
FROM public.users u
JOIN public.users_roles ur ON u.id = ur."userId"
JOIN public.roles r ON ur."roleId" = r.id
JOIN public.roles_privileges rp ON r.id = rp."roleId"
JOIN public.privileges p ON rp."privilegeId" = p.id
WHERE u.active = true
  AND r.active = true
GROUP BY u.id, u."fullName", u.email;

-- ============================================================================
-- End of Views
-- ============================================================================
-- 
-- Usage in Prisma:
-- These views are defined in schema.prisma with @@ignore, which means:
-- - They exist in the database
-- - Prisma won't try to manage them
-- - You can still query them via raw SQL if needed:
--   await prisma.$queryRaw`SELECT * FROM public.v_ticket_dashboard`
--   await prisma.$queryRaw`SELECT * FROM public.user_privileges_summary WHERE user_id = ${userId}`
-- ============================================================================

