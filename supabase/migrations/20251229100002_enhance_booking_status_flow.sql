-- Enhance booking status flow with ACCEPTED and PAYMENT_PENDING states
-- Migration: 20251229100002_enhance_booking_status_flow.sql
-- Purpose: Add missing booking statuses for provider acceptance and payment pending

BEGIN;

-- Add ACCEPTED status (provider accepts booking after CONFIRMED)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'ACCEPTED' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'booking_status')
  ) THEN
    -- Insert ACCEPTED after CONFIRMED
    ALTER TYPE booking_status ADD VALUE 'ACCEPTED';
  END IF;
END $$;

-- Add PAYMENT_PENDING status (service completed, awaiting payment)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'PAYMENT_PENDING' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'booking_status')
  ) THEN
    -- Insert PAYMENT_PENDING after COMPLETED
    ALTER TYPE booking_status ADD VALUE 'PAYMENT_PENDING';
  END IF;
END $$;

-- Create trigger to validate booking status transitions
CREATE OR REPLACE FUNCTION validate_booking_status_transition()
RETURNS TRIGGER AS $$
DECLARE
  valid_transitions JSONB := '{
    "PENDING": ["CONFIRMED", "CANCELLED"],
    "CONFIRMED": ["ACCEPTED", "CANCELLED"],
    "ACCEPTED": ["IN_PROGRESS", "CANCELLED"],
    "IN_PROGRESS": ["COMPLETED", "CANCELLED"],
    "COMPLETED": ["PAYMENT_PENDING"],
    "PAYMENT_PENDING": ["COMPLETED"],
    "CANCELLED": []
  }'::JSONB;
BEGIN
  -- Allow initial status setting
  IF OLD.status IS NULL THEN
    RETURN NEW;
  END IF;

  -- Check if transition is valid
  IF NOT (valid_transitions->OLD.status::TEXT) ? NEW.status::TEXT THEN
    RAISE EXCEPTION 'Invalid booking status transition from % to %', OLD.status, NEW.status;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS enforce_booking_status_transition ON bookings;

-- Create trigger
CREATE TRIGGER enforce_booking_status_transition
  BEFORE UPDATE OF status ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION validate_booking_status_transition();

COMMIT;
