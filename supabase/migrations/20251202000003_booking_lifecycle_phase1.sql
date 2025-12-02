-- Unified Booking Lifecycle - Phase 1: REQUEST
-- Migration: 20251202000003_booking_lifecycle_phase1.sql

-- 1. Extend bookings table for unified lifecycle
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_mode TEXT CHECK (service_mode IN ('local', 'online'));
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS input_method TEXT CHECK (input_method IN ('voice', 'text', 'form'));
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS voice_transcript TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS estimated_price_min DECIMAL(10,2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS estimated_price_max DECIMAL(10,2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS estimated_duration_min INTEGER; -- minutes
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS estimated_duration_max INTEGER;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS preferred_time TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS urgency TEXT CHECK (urgency IN ('low', 'normal', 'high', 'emergency'));
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS ai_classification JSONB;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pricing_breakdown JSONB;

-- 2. Create booking lifecycle events table
CREATE TABLE IF NOT EXISTS booking_lifecycle_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  phase TEXT NOT NULL CHECK (phase IN ('REQUEST', 'MATCH', 'CONFIRM', 'EXECUTE', 'COMPLETE', 'REVIEW')),
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create service pricing table (reduced rates)
CREATE TABLE IF NOT EXISTS service_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_category TEXT NOT NULL UNIQUE,
  service_mode TEXT NOT NULL CHECK (service_mode IN ('local', 'online')),
  base_price DECIMAL(10,2) NOT NULL,
  price_unit TEXT DEFAULT 'per_service',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Insert reduced base prices
INSERT INTO service_pricing (service_category, service_mode, base_price, price_unit) VALUES
  -- Local services (reduced rates)
  ('cleaning', 'local', 200, 'per_service'),
  ('plumbing', 'local', 250, 'per_service'),
  ('electrician', 'local', 250, 'per_service'),
  ('carpenter', 'local', 300, 'per_service'),
  ('painting', 'local', 350, 'per_service'),
  ('appliance_repair', 'local', 200, 'per_service'),
  ('pest_control', 'local', 400, 'per_service'),
  ('home_cleaning', 'local', 250, 'per_service'),
  
  -- Online services (reduced rates)
  ('tax_consulting', 'online', 300, 'per_hour'),
  ('web_development', 'online', 400, 'per_hour'),
  ('graphic_design', 'online', 350, 'per_hour'),
  ('content_writing', 'online', 200, 'per_hour'),
  ('digital_marketing', 'online', 450, 'per_hour'),
  ('tutoring', 'online', 250, 'per_hour'),
  ('legal_consulting', 'online', 500, 'per_hour'),
  ('accounting', 'online', 350, 'per_hour')
ON CONFLICT (service_category) DO UPDATE SET
  base_price = EXCLUDED.base_price,
  updated_at = NOW();

-- 5. Performance indexes
CREATE INDEX IF NOT EXISTS idx_bookings_service_mode ON bookings(service_mode);
CREATE INDEX IF NOT EXISTS idx_bookings_status_created ON bookings(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_urgency ON bookings(urgency) WHERE urgency IN ('high', 'emergency');
CREATE INDEX IF NOT EXISTS idx_lifecycle_events_booking ON booking_lifecycle_events(booking_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lifecycle_events_phase ON booking_lifecycle_events(phase, created_at DESC);

-- 6. Create function to auto-log lifecycle events
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
        WHEN NEW.status = 'IN_PROGRESS' THEN 'EXECUTE'
        WHEN NEW.status = 'COMPLETED' THEN 'COMPLETE'
        ELSE 'REQUEST'
      END,
      'status_changed',
      jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger for auto-logging
DROP TRIGGER IF EXISTS booking_status_change_trigger ON bookings;
CREATE TRIGGER booking_status_change_trigger
  AFTER UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION log_booking_status_change();

-- 8. Comments for documentation
COMMENT ON COLUMN bookings.service_mode IS 'Whether service is local (physical) or online (remote)';
COMMENT ON COLUMN bookings.input_method IS 'How customer submitted request: voice, text, or form';
COMMENT ON COLUMN bookings.voice_transcript IS 'Transcribed text from voice input';
COMMENT ON COLUMN bookings.urgency IS 'Customer urgency level affecting pricing and matching';
COMMENT ON COLUMN bookings.ai_classification IS 'Gemini AI classification result';
COMMENT ON COLUMN bookings.pricing_breakdown IS 'Detailed pricing calculation';
COMMENT ON TABLE booking_lifecycle_events IS 'Complete audit trail of booking state transitions';
COMMENT ON TABLE service_pricing IS 'Base pricing for services (reduced rates)';
