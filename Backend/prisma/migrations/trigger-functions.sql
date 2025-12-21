-- ============================================================================
-- Database Trigger Functions Migration
-- ============================================================================
-- These trigger functions provide automatic database-level functionality:
-- 1. Auto-generate sequential ticket folios
-- 2. Auto-calculate SLA deadlines based on configuration
-- 
-- Run this after your initial Prisma migration.
-- ============================================================================

-- ============================================================================
-- 1. Generate Folio Function
-- ============================================================================
-- Automatically generates sequential folios in the format: CEA-YYYY-#####
-- Examples: CEA-2025-00001, CEA-2025-00002, etc.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.trigger_generate_folio()
RETURNS TRIGGER AS $$
DECLARE
  year_part TEXT;
  seq_num INTEGER;
BEGIN
  -- Only generate folio if not provided
  IF NEW.folio IS NULL OR NEW.folio = '' THEN
    year_part := EXTRACT(YEAR FROM CURRENT_TIMESTAMP)::TEXT;
    
    -- Get next sequence number for this year
    -- Looks for the highest number in existing folios for current year
    SELECT COALESCE(MAX(CAST(SUBSTRING(folio FROM 10) AS INTEGER)), 0) + 1
    INTO seq_num
    FROM public.tickets
    WHERE folio LIKE 'CEA-' || year_part || '-%';
    
    -- Format: CEA-2025-00001
    NEW.folio := 'CEA-' || year_part || '-' || LPAD(seq_num::TEXT, 5, '0');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to tickets table
DROP TRIGGER IF EXISTS auto_generate_folio ON public.tickets;
CREATE TRIGGER auto_generate_folio
  BEFORE INSERT ON public.tickets
  FOR EACH ROW 
  EXECUTE FUNCTION public.trigger_generate_folio();

-- ============================================================================
-- 2. Set SLA Deadline Function
-- ============================================================================
-- Automatically calculates and sets the SLA deadline based on:
-- - service_type (e.g., reportes_fugas, aclaraciones)
-- - priority (urgente, alta, media, baja)
-- - resolution_time_minutes from sla_config table
-- ============================================================================

CREATE OR REPLACE FUNCTION public.trigger_set_sla_deadline()
RETURNS TRIGGER AS $$
DECLARE
  resolution_minutes INTEGER;
BEGIN
  -- Look up resolution time from sla_config table
  SELECT "resolutionTimeMinutes" INTO resolution_minutes
  FROM public.sla_config
  WHERE "serviceType" = NEW."serviceType" 
    AND priority = NEW.priority;
  
  -- If configuration exists, calculate deadline
  IF resolution_minutes IS NOT NULL THEN
    NEW."slaDeadline" := NEW."createdAt" + (resolution_minutes || ' minutes')::INTERVAL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to tickets table
DROP TRIGGER IF EXISTS auto_set_sla ON public.tickets;
CREATE TRIGGER auto_set_sla
  BEFORE INSERT ON public.tickets
  FOR EACH ROW 
  EXECUTE FUNCTION public.trigger_set_sla_deadline();

-- ============================================================================
-- End of Trigger Functions
-- ============================================================================
-- 
-- Note: The update_timestamp triggers are NOT included here because we're
-- using Prisma's @updatedAt directive instead, which handles timestamp
-- updates at the application level.
-- ============================================================================

