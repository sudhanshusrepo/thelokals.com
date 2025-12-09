-- Unified Booking Lifecycle - Phase 2: Matching Trigger
-- Migration: 20251203000002_booking_webhook.sql

-- 1. Create the webhook trigger
-- Note: This requires the pg_net extension to be enabled (usually enabled by default in Supabase)
-- and the edge function to be deployed.

-- Create a trigger function that calls the Edge Function
CREATE OR REPLACE FUNCTION trigger_process_booking()
RETURNS TRIGGER AS $$
DECLARE
  project_url TEXT;
  service_key TEXT;
BEGIN
  -- You would typically store these in a secure way or hardcode for the migration if needed.
  -- For Supabase, we can often use the internal network or a configured secret.
  -- Ideally, use pg_net to make an async HTTP request.
  
  -- HOWEVER, for simplicity and standard Supabase patterns, we often use the 
  -- "Database Webhooks" feature in the dashboard. 
  -- But since we are doing this via SQL migration, we can use pg_net.
  
  -- Check if status is REQUESTED
  IF NEW.status = 'REQUESTED' THEN
    -- Call the Edge Function
    -- Note: Replace PROJECT_REF and ANON_KEY/SERVICE_KEY with actual values or env vars if possible.
    -- Since we can't easily inject env vars into SQL here without a pre-processor,
    -- we will assume the user will configure the webhook via the Dashboard OR 
    -- we use a placeholder that needs to be replaced.
    
    -- ALTERNATIVE: Use the `supabase_functions` schema if available (some setups have it)
    -- OR simply rely on the application logic to call it? 
    -- NO, the user asked for a Database Webhook.
    
    -- Let's use the standard Supabase "http_request" via pg_net if available.
    -- Assuming pg_net is available:
    
    PERFORM net.http_post(
      url := 'https://<PROJECT_REF>.supabase.co/functions/v1/process-booking',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer <SERVICE_ROLE_KEY>"}',
      body := jsonb_build_object(
        'type', 'INSERT',
        'table', 'bookings',
        'record', row_to_json(NEW),
        'schema', 'public'
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- NOTE: The above SQL requires replacing <PROJECT_REF> and <SERVICE_ROLE_KEY>.
-- Since we cannot know these at migration time easily in this environment,
-- I will create a simplified version that relies on the Supabase Dashboard Webhook feature
-- OR I will create the Trigger but comment out the net.http_post part with instructions.

-- BETTER APPROACH for this environment:
-- Create a trigger that inserts into a 'job_queue' table, and have the Edge Function 
-- triggered by THAT or have a separate worker. 
-- BUT the user specifically asked for "Supabase Database Webhook".

-- Let's create the Trigger definition that would work with the Supabase Dashboard "Database Webhooks" UI.
-- The UI actually creates a trigger that calls an internal function `supabase_functions.http_request`.

-- Migration to enable the webhook (This is the standard SQL way Supabase uses internally)
-- We'll create a trigger that fires on INSERT for bookings.

CREATE TRIGGER on_booking_created
  AFTER INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION supabase_functions.http_request(
    'https://<PROJECT_REF>.supabase.co/functions/v1/process-booking',
    'POST',
    '{"Content-Type":"application/json", "Authorization":"Bearer <SERVICE_ROLE_KEY>"}'
  );

-- IMPORTANT: This migration file is a TEMPLATE. 
-- The user needs to replace <PROJECT_REF> and <SERVICE_ROLE_KEY> before running it,
-- OR configure it via the Supabase Dashboard > Database > Webhooks.
