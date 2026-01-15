-- Atomic Booking Acceptance Function
DROP FUNCTION IF EXISTS accept_live_booking(uuid, uuid);

CREATE OR REPLACE FUNCTION accept_live_booking(
  p_request_id UUID, -- This maps to booking_id in our current logic
  p_provider_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking_id UUID;
  v_status booking_status;
BEGIN
  -- We assume p_request_id passes the booking_id directly
  v_booking_id := p_request_id;

  -- 1. Lock the booking row
  SELECT status INTO v_status
  FROM bookings
  WHERE id = v_booking_id
  FOR UPDATE;

  -- 2. Validate Status
  -- Map: 'BOOKING_CREATED', 'PROVIDER_MATCHING', 'SEARCHING', 'REQUESTED' -> 'PENDING'
  IF v_status NOT IN ('PENDING') THEN
     RETURN jsonb_build_object('success', false, 'message', 'Job is no longer available (Status: ' || v_status || ')');
  END IF;

  -- 3. Update Booking
  UPDATE bookings
  SET 
    status = 'CONFIRMED', -- Standard state
    provider_id = p_provider_id,
    updated_at = NOW()
  WHERE id = v_booking_id;

  -- 4. Update Requests (Fan-out cleanup)
  UPDATE booking_requests
  SET status = 'ACCEPTED'
  WHERE booking_id = v_booking_id AND provider_id = p_provider_id;

  UPDATE booking_requests
  SET status = 'EXPIRED'
  WHERE booking_id = v_booking_id AND provider_id != p_provider_id;

  RETURN jsonb_build_object('success', true, 'message', 'Booking accepted');

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;

-- Fan-out Request Creation
DROP FUNCTION IF EXISTS create_booking_requests(uuid, uuid[]);

CREATE OR REPLACE FUNCTION create_booking_requests(
  p_booking_id UUID,
  p_provider_ids UUID[]
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO booking_requests (booking_id, provider_id, status)
  SELECT p_booking_id, unnest(p_provider_ids), 'PENDING'
  ON CONFLICT (booking_id, provider_id) DO NOTHING;
END;
$$;
