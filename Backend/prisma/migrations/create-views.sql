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
-- End of Views
-- ============================================================================
-- 
-- Usage in Prisma:
-- These views are defined in schema.prisma with @@ignore, which means:
-- - They exist in the database
-- - Prisma won't try to manage them
-- - You can still query them via raw SQL if needed:
--   await prisma.$queryRaw`SELECT * FROM public.v_ticket_dashboard`
-- ============================================================================

