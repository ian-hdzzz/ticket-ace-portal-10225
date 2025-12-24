-- Enable the pg_net extension to make HTTP requests
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- Function to handle changes in opportunities
CREATE OR REPLACE FUNCTION public.handle_opportunity_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the opportunity is ready to schedule (listo_para_agendar changed to true)
  IF NEW.listo_para_agendar = true AND (OLD.listo_para_agendar = false OR OLD.listo_para_agendar IS NULL) THEN
    PERFORM net.http_post(
      url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/cea-trigger-handler',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
      body := jsonb_build_object(
        'type', 'opportunity_ready',
        'record', row_to_json(NEW),
        'old_record', row_to_json(OLD)
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger for opportunities
DROP TRIGGER IF EXISTS on_opportunity_update ON public.opportunities;
CREATE TRIGGER on_opportunity_update
  AFTER UPDATE ON public.opportunities
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_opportunity_update();


-- Function to handle changes in contacts (personas)
CREATE OR REPLACE FUNCTION public.handle_persona_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if relevant fields changed (email, phone, etc.)
  IF NEW.correo IS DISTINCT FROM OLD.correo OR NEW.whatsapp IS DISTINCT FROM OLD.whatsapp THEN
    PERFORM net.http_post(
      url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/cea-trigger-handler',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
      body := jsonb_build_object(
        'type', 'persona_update',
        'record', row_to_json(NEW),
        'old_record', row_to_json(OLD)
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger for personas
DROP TRIGGER IF EXISTS on_persona_update ON public.personas;
CREATE TRIGGER on_persona_update
  AFTER UPDATE ON public.personas
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_persona_update();

-- Function to handle changes in tickets
CREATE OR REPLACE FUNCTION public.handle_ticket_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. Status Changes (Close/Cancel)
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'resuelto' OR NEW.status = 'cerrado' THEN
       PERFORM net.http_post(
        url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/cea-trigger-handler',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
        body := jsonb_build_object(
          'type', 'ticket_closed',
          'record', row_to_json(NEW),
          'old_record', row_to_json(OLD)
        )
      );
    ELSIF NEW.status = 'cancelado' THEN
       PERFORM net.http_post(
        url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/cea-trigger-handler',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
        body := jsonb_build_object(
          'type', 'ticket_cancelled',
          'record', row_to_json(NEW),
          'old_record', row_to_json(OLD)
        )
      );
    END IF;
  END IF;

  -- 2. Metadata Changes (Resolve OT, Informar Visita, Invoice Change)
  -- Check if metadata changed
  IF NEW.metadata IS DISTINCT FROM OLD.metadata THEN
      -- Check for OT Resolution
      IF (NEW.metadata->>'ot_resolution') IS NOT NULL AND (OLD.metadata->>'ot_resolution') IS DISTINCT FROM (NEW.metadata->>'ot_resolution') THEN
         PERFORM net.http_post(
          url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/cea-trigger-handler',
          headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
          body := jsonb_build_object(
            'type', 'resolve_ot',
            'record', row_to_json(NEW),
            'old_record', row_to_json(OLD)
          )
        );
      END IF;

      -- Check for Visit Info
      IF (NEW.metadata->>'visit_info') IS NOT NULL AND (OLD.metadata->>'visit_info') IS DISTINCT FROM (NEW.metadata->>'visit_info') THEN
         PERFORM net.http_post(
          url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/cea-trigger-handler',
          headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
          body := jsonb_build_object(
            'type', 'informar_visita',
            'record', row_to_json(NEW),
            'old_record', row_to_json(OLD)
          )
        );
      END IF;

      -- Check for Invoice Change
      IF (NEW.metadata->>'invoice_change') IS NOT NULL AND (OLD.metadata->>'invoice_change') IS DISTINCT FROM (NEW.metadata->>'invoice_change') THEN
         PERFORM net.http_post(
          url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/cea-trigger-handler',
          headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
          body := jsonb_build_object(
            'type', 'invoice_change',
            'record', row_to_json(NEW),
            'old_record', row_to_json(OLD)
          )
        );
      END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger for tickets
DROP TRIGGER IF EXISTS on_ticket_update ON public.tickets;
CREATE TRIGGER on_ticket_update
  AFTER UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_ticket_update();

