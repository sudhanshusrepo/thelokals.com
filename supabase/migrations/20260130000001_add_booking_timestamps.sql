-- Sprint 9 Completion: Add Missing Timestamp Columns
-- Fixes schema mismatch where liveBookingService references columns that don't exist

BEGIN;

-- Add missing timestamp columns to bookings table
ALTER TABLE bookings 
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Add indexes for common queries on these columns
CREATE INDEX IF NOT EXISTS idx_bookings_started_at ON bookings(started_at) WHERE started_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_completed_at ON bookings(completed_at) WHERE completed_at IS NOT NULL;

-- Update complete_booking RPC to set completed_at timestamp
CREATE OR REPLACE FUNCTION complete_booking(
  p_booking_id UUID,
  p_provider_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_status TEXT;
BEGIN
  -- Check current status
  SELECT status INTO v_status
  FROM bookings
  WHERE id = p_booking_id AND provider_id = p_provider_id;
  
  IF v_status IS NULL THEN
    RETURN jsonb_build_object(
      'success', false, 
      'message', 'Booking not found or you are not the assigned provider'
    );
  END IF;
  
  IF v_status != 'IN_PROGRESS' THEN
    RETURN jsonb_build_object(
      'success', false, 
      'message', 'Booking must be IN_PROGRESS to complete. Current status: ' || v_status
    );
  END IF;
  
  -- Update booking to COMPLETED with timestamp
  UPDATE bookings
  SET 
    status = 'COMPLETED',
    completed_at = NOW()
  WHERE id = p_booking_id
    AND provider_id = p_provider_id;
  
  RETURN jsonb_build_object('success', true, 'message', 'Booking completed successfully');
END;
$$;

-- Create or update function to set started_at when job starts
CREATE OR REPLACE FUNCTION update_booking_status_with_timestamp(
  p_booking_id UUID,
  p_new_status TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_status TEXT;
BEGIN
  -- Get current status
  SELECT status INTO v_current_status
  FROM bookings
  WHERE id = p_booking_id;
  
  IF v_current_status IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Booking not found');
  END IF;
  
  -- Update status with appropriate timestamp
  IF p_new_status = 'IN_PROGRESS' AND v_current_status = 'EN_ROUTE' THEN
    UPDATE bookings
    SET status = p_new_status, started_at = NOW()
    WHERE id = p_booking_id;
  ELSIF p_new_status = 'COMPLETED' AND v_current_status = 'IN_PROGRESS' THEN
    UPDATE bookings
    SET status = p_new_status, completed_at = NOW()
    WHERE id = p_booking_id;
  ELSE
    -- Regular status update without timestamp
    UPDATE bookings
    SET status = p_new_status
    WHERE id = p_booking_id;
  END IF;
  
  RETURN jsonb_build_object('success', true, 'message', 'Status updated to ' || p_new_status);
END;
$$;

COMMIT;
