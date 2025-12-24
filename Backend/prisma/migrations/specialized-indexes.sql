-- ============================================================================
-- Specialized Indexes Migration
-- ============================================================================
-- These indexes use PostgreSQL-specific features that Prisma doesn't support
-- in its schema DSL. Run this after your initial Prisma migration.
-- ============================================================================

-- Enable pg_trgm extension for trigram fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN index for JSONB metadata search on media_assets
CREATE INDEX IF NOT EXISTS idx_media_metadata_gin 
  ON public.media_assets USING gin (metadata);

-- GIN index for JSONB metadata search on ticket_media
CREATE INDEX IF NOT EXISTS idx_ticket_media_metadata_gin 
  ON public.ticket_media USING gin (metadata);

-- Trigram GIN index for fuzzy name search on customers
-- This enables fast LIKE/ILIKE queries and similarity searches
CREATE INDEX IF NOT EXISTS idx_customers_nombre 
  ON public.customers USING gin ("nombreTitular" gin_trgm_ops);

-- ============================================================================
-- End of Specialized Indexes
-- ============================================================================

