-- Add REQUESTED and EXPIRED to booking_status enum
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_enum
        WHERE enumtypid = 'booking_status'::regtype
        AND enumlabel = 'REQUESTED'
    ) THEN
        ALTER TYPE public.booking_status ADD VALUE 'REQUESTED' AFTER 'PENDING';
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_enum
        WHERE enumtypid = 'booking_status'::regtype
        AND enumlabel = 'EXPIRED'
    ) THEN
        ALTER TYPE public.booking_status ADD VALUE 'EXPIRED';
    END IF;
END$$;

-- Update the accept_booking function to handle concurrent requests from multiple providers
CREATE OR REPLACE FUNCTION accept_booking(p_booking_id uuid, p_provider_id uuid)
RETURNS jsonb
AS $$
DECLARE
  v_booking bookings;
  v_request booking_requests;
BEGIN
  -- It's critical to lock the booking_requests for the given booking_id
  -- to prevent race conditions where multiple providers accept at the same time.
  -- We lock all pending requests for this booking.
  PERFORM *
  FROM booking_requests
  WHERE booking_id = p_booking_id
    AND status = 'PENDING'
  FOR UPDATE;

  -- Check if a request for this provider and booking exists and is pending
  SELECT * INTO v_request
  FROM booking_requests
  WHERE booking_id = p_booking_id
    AND provider_id = p_provider_id
    AND status = 'PENDING';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking request is not available for you to accept. It might have been taken by another provider or expired.';
  END IF;

  -- Try to update the main booking record.
  -- The WHERE clause ensures that we only update if it's still in the 'REQUESTED' state.
  -- This is the deciding step for which provider gets the booking.
  UPDATE bookings
  SET
    worker_id = p_provider_id,
    status = 'CONFIRMED',
    acceptedAt = NOW()
  WHERE
    id = p_booking_id AND status = 'REQUESTED'
  RETURNING * INTO v_booking;

  -- If the UPDATE was successful, this provider won the race.
  IF FOUND THEN
    -- Update this provider's request to ACCEPTED
    UPDATE booking_requests
    SET status = 'ACCEPTED', updated_at = NOW()
    WHERE request_id = v_request.request_id;

    -- Update all other PENDING requests for this booking to EXPIRED
    UPDATE booking_requests
    SET status = 'EXPIRED', updated_at = NOW()
    WHERE
      booking_id = p_booking_id AND
      provider_id != p_provider_id AND
      status = 'PENDING';

    RETURN to_jsonb(v_booking);
  ELSE
    -- The booking was not in 'REQUESTED' state, which means another provider
    -- accepted it between the initial check and this provider's attempt.
    -- We already locked the rows, so this path may not be hit often, but it's a good safeguard.
    RAISE EXCEPTION 'Booking was already accepted by another provider.';
  END IF;
END;
$$ LANGUAGE plpgsql;
