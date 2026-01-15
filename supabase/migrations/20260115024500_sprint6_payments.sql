-- Sprint 6: Job Completion & Payment RPCs

-- 1. Complete Booking (Provider Action)
CREATE OR REPLACE FUNCTION complete_booking(
  p_booking_id UUID,
  p_provider_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_status booking_status;
BEGIN
  -- Verify Provider owns the booking and it is IN_PROGRESS
  SELECT status INTO v_status
  FROM bookings
  WHERE id = p_booking_id AND provider_id = p_provider_id;

  IF v_status IS NULL THEN
     RETURN jsonb_build_object('success', false, 'message', 'Booking not found or not assigned to you.');
  END IF;

  IF v_status != 'IN_PROGRESS' THEN
     RETURN jsonb_build_object('success', false, 'message', 'Booking is not in progress.');
  END IF;

  -- Update to COMPLETED
  UPDATE bookings
  SET 
    status = 'COMPLETED',
    completed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_booking_id;

  RETURN jsonb_build_object('success', true, 'message', 'Job completed.');
END;
$$;

-- 2. Process Payment (Client Action - Mock)
CREATE OR REPLACE FUNCTION process_payment(
  p_booking_id UUID,
  p_amount NUMERIC,
  p_method TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_status booking_status;
BEGIN
  -- Verify Booking is ready for payment
  SELECT status INTO v_status
  FROM bookings
  WHERE id = p_booking_id;

  -- Allow payment if COMPLETED or PAYMENT_PENDING
  IF v_status NOT IN ('COMPLETED', 'PAYMENT_PENDING') THEN
     RETURN jsonb_build_object('success', false, 'message', 'Booking is not ready for payment (Status: ' || v_status || ')');
  END IF;

  -- Update to PAYMENT_SUCCESS
  -- In a real app, we would record a transaction row here.
  UPDATE bookings
  SET 
    status = 'PAYMENT_SUCCESS',
    updated_at = NOW()
  WHERE id = p_booking_id;

  RETURN jsonb_build_object('success', true, 'message', 'Payment successful.');
END;
$$;
