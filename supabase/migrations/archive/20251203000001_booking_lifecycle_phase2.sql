-- Unified Booking Lifecycle - Phase 2: MATCH
-- Migration: 20251203000001_booking_lifecycle_phase2.sql

-- 1. Create booking_requests table
CREATE TABLE IF NOT EXISTS booking_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED')) DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(booking_id, provider_id)
);

-- 2. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_booking_requests_provider_status ON booking_requests(provider_id, status);
CREATE INDEX IF NOT EXISTS idx_booking_requests_booking ON booking_requests(booking_id);

-- 3. Function to handle booking acceptance (Race Condition Handling)
CREATE OR REPLACE FUNCTION accept_booking(
  p_booking_id UUID,
  p_provider_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_booking_status TEXT;
  v_request_status TEXT;
BEGIN
  -- Lock the booking row
  SELECT status INTO v_booking_status FROM bookings WHERE id = p_booking_id FOR UPDATE;
  
  -- Check if booking is still available
  IF v_booking_status NOT IN ('REQUESTED', 'PENDING') THEN
    RETURN jsonb_build_object('success', false, 'message', 'Booking already taken or cancelled');
  END IF;

  -- Check if request exists and is pending
  SELECT status INTO v_request_status FROM booking_requests 
  WHERE booking_id = p_booking_id AND provider_id = p_provider_id;

  IF v_request_status != 'PENDING' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Request is no longer valid');
  END IF;

  -- Update booking
  UPDATE bookings 
  SET 
    status = 'CONFIRMED', 
    provider_id = p_provider_id,
    updated_at = NOW()
  WHERE id = p_booking_id;

  -- Update this request to ACCEPTED
  UPDATE booking_requests 
  SET status = 'ACCEPTED', updated_at = NOW()
  WHERE booking_id = p_booking_id AND provider_id = p_provider_id;

  -- Expire other requests for this booking
  UPDATE booking_requests 
  SET status = 'EXPIRED', updated_at = NOW()
  WHERE booking_id = p_booking_id AND provider_id != p_provider_id;

  RETURN jsonb_build_object('success', true, 'message', 'Booking accepted successfully');
END;
$$ LANGUAGE plpgsql;

-- 4. Enable RLS on booking_requests
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;

-- Providers can see their own requests
CREATE POLICY providers_view_own_requests ON booking_requests
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM providers WHERE id = provider_id
    )
  );

-- Providers can update their own requests (Accept/Reject)
CREATE POLICY providers_update_own_requests ON booking_requests
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM providers WHERE id = provider_id
    )
  );

-- Clients can see requests for their bookings (optional, for transparency)
CREATE POLICY clients_view_booking_requests ON booking_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings 
      WHERE bookings.id = booking_requests.booking_id 
      AND bookings.client_id = auth.uid()
    )
  );
