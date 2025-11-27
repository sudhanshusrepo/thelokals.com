
-- Create the booking_requests table
CREATE TABLE booking_requests (
  request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  provider_id UUID REFERENCES providers(id),
  status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING | ACCEPTED | REJECTED | EXPIRED
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create a function to find nearby providers
CREATE OR REPLACE FUNCTION find_nearby_providers(lat float, lng float, service_id text, max_distance int)
RETURNS TABLE (id uuid, name text, location jsonb)
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.name, p.location
  FROM providers p
  WHERE p.is_online = TRUE
    AND p.services @> ARRAY[service_id]
    AND ST_DWithin(
      p.location::geography,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
      max_distance
    );
END;
$$ LANGUAGE plpgsql;

-- Create a function to accept a booking
CREATE OR REPLACE FUNCTION accept_booking(booking_id uuid, provider_id uuid)
RETURNS jsonb
AS $$
DECLARE
  booking bookings;
BEGIN
  UPDATE bookings
  SET providerId = provider_id, status = 'ACCEPTED', acceptedAt = NOW()
  WHERE id = booking_id AND status = 'REQUESTED'
  RETURNING * INTO booking;

  IF FOUND THEN
    RETURN to_jsonb(booking);
  ELSE
    RAISE EXCEPTION 'Booking not available';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Add new columns to the bookings table
ALTER TABLE bookings
ADD COLUMN serviceId TEXT,
ADD COLUMN clientId UUID,
ADD COLUMN providerId UUID,
ADD COLUMN requirements JSONB,
ADD COLUMN otp TEXT,
ADD COLUMN acceptedAt TIMESTAMPTZ,
ADD COLUMN startedAt TIMESTAMPTZ,
ADD COLUMN completedAt TIMESTAMPTZ;
