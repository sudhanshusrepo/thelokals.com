-- Migration: Phase 5 - Unified Booking Lifecycle Updates
-- Description: Update lifecycle logging to handle 'EN_ROUTE' status

CREATE OR REPLACE FUNCTION log_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    INSERT INTO booking_lifecycle_events (booking_id, phase, event_type, event_data)
    VALUES (
      NEW.id,
      CASE 
        WHEN NEW.status = 'REQUESTED' THEN 'REQUEST'
        WHEN NEW.status IN ('PENDING', 'CONFIRMED') THEN 'MATCH'
        WHEN NEW.status = 'EN_ROUTE' THEN 'EXECUTE' -- Added EN_ROUTE
        WHEN NEW.status = 'IN_PROGRESS' THEN 'EXECUTE'
        WHEN NEW.status = 'COMPLETED' THEN 'COMPLETE'
        WHEN NEW.status = 'CANCELLED' THEN 'COMPLETE'
        ELSE 'REQUEST'
      END,
      'status_changed',
      jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure index exists for performant timeline queries
CREATE INDEX IF NOT EXISTS idx_lifecycle_booking_phase_created ON booking_lifecycle_events(booking_id, phase, created_at);
