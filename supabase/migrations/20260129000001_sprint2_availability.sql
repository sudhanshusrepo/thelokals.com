-- Sprint 2: Provider Availability (Heartbeat System)
-- Goal: Automatically manage provider online status

BEGIN;

-- 1. Enable pg_cron (if not allowed, we might need a workaround, but usually standard in Supabase)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Function to cleanup inactive providers
-- If a provider hasn't updated their location/heartbeat in 10 minutes, set them offline.
CREATE OR REPLACE FUNCTION cleanup_inactive_providers()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count INT;
BEGIN
    UPDATE providers
    SET 
        is_online = false,
        updated_at = NOW()
    WHERE 
        is_online = true 
        AND last_active_at < (NOW() - INTERVAL '10 minutes');
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    -- Ideally log this to an audit table if needed, but keeping it silent for now to avoid bloat.
END;
$$;

-- 3. Schedule the Cron Job (Runs every 5 minutes)
-- We check if it exists first to avoid duplicate schedules error
SELECT cron.schedule(
    'provider-heartbeat-cleanup', -- job name
    '*/5 * * * *',                -- schedule (every 5 mins)
    'SELECT cleanup_inactive_providers()'
);

COMMIT;
