
-- migrations/003_invalidation.sql
-- Cache Invalidation Logic

-- 1. Create a function to notify listeners about changes
CREATE OR REPLACE FUNCTION invalidate_service_cache() 
RETURNS TRIGGER AS $$
BEGIN
  -- Payload: service_id that changed
  -- This notification can be picked up by a listener service or Supabase Realtime
  -- to proactively invalidate KV keys if needed.
  PERFORM pg_notify('availability_changed', OLD.service_id::text);
  
  -- If we had a direct way to call Cloudflare API here, we would using pg_net (if available)
  -- For now, pg_notify is the standard event bus pattern.
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 2. Create Trigger
DROP TRIGGER IF EXISTS trg_service_availability_change ON service_availability;

CREATE TRIGGER trg_service_availability_change
AFTER UPDATE OR DELETE ON service_availability
FOR EACH ROW EXECUTE PROCEDURE invalidate_service_cache();

-- Also handle INSERT (using NEW.service_id)
CREATE OR REPLACE FUNCTION invalidate_service_cache_insert() 
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('availability_changed', NEW.service_id::text);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_service_availability_insert ON service_availability;

CREATE TRIGGER trg_service_availability_insert
AFTER INSERT ON service_availability
FOR EACH ROW EXECUTE PROCEDURE invalidate_service_cache_insert();
