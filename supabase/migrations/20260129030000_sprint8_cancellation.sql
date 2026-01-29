-- Sprint 8: Cancellation Logic
-- Goal: Atomic cancellation for bookings

BEGIN;

-- 1. RPC: Cancel Booking (Client Side)
-- Handles cleanup of requests and enforces state transition rules.

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

CREATE OR REPLACE FUNCTION cancel_booking(
  p_booking_id UUID,
  p_reason TEXT DEFAULT 'Client cancelled'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_status TEXT; -- Using TEXT to be safe against enum issues
  v_client_id UUID;
BEGIN
  -- Ensure column exists (idempotent)
  -- Note: DDL inside PL/PGSQL function is tricky, better to do outside.
  -- But we can't do DDL inside a function easily.
  -- We will do ALTER TABLE before CREATE FUNCTION in the migration block.

  -- 1. Lock and Validate
  SELECT status::TEXT, user_id INTO v_status, v_client_id
  FROM bookings
  WHERE id = p_booking_id
  FOR UPDATE;

  -- Ensure caller is the owner (RLS handles read, but logic check is safer)
  IF v_client_id != auth.uid() THEN
     RETURN jsonb_build_object('success', false, 'message', 'Not authorized to cancel this booking');
  END IF;

  -- Allow cancellation only in early stages
  -- 'PENDING' (Searching), 'CONFIRMED' (Matched), 'EN_ROUTE' (Provider on way - maybe penalty later)
  IF v_status NOT IN ('PENDING', 'CONFIRMED', 'EN_ROUTE') THEN
     RETURN jsonb_build_object('success', false, 'message', 'Cannot cancel booking in status: ' || v_status);
  END IF;

  -- 2. Update Booking
  UPDATE bookings
  SET 
    status = 'CANCELLED',
    cancellation_reason = p_reason,
    updated_at = NOW()
  WHERE id = p_booking_id;

  -- 3. Cleanup Requests (if any pending)
  UPDATE booking_requests
  SET status = 'CANCELLED'
  WHERE booking_id = p_booking_id AND status = 'PENDING';

  RETURN jsonb_build_object('success', true, 'message', 'Booking cancelled successfully');

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;

COMMIT;
