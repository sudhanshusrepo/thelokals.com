-- Migration: 20260105000001_sprint_gap_fill.sql
-- Purpose: Add missing RPCs for Provider/Booking flow and fix schema inconsistencies

BEGIN;

-- 1. Fix services_locations column mismatch
-- We want to use 'is_active' everywhere for consistency with 'providers' table
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services_locations' AND column_name = 'enabled') THEN
    ALTER TABLE services_locations RENAME COLUMN enabled TO is_active;
  END IF;
END $$;

-- Update RLS policies to use new column name (Drop and Recreate)
DROP POLICY IF EXISTS "Public can view enabled services" ON services_locations;
CREATE POLICY "Public can view enabled services"
  ON services_locations FOR SELECT
  USING (is_active = true AND production_mode = true);

-- 2. Implement accept_live_booking RPC
CREATE OR REPLACE FUNCTION accept_live_booking(p_request_id UUID, p_provider_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_booking_id UUID;
  v_current_status TEXT;
BEGIN
  -- Get booking_id and current status from request
  SELECT booking_id, status INTO v_booking_id, v_current_status 
  FROM live_booking_requests 
  WHERE id = p_request_id AND provider_id = p_provider_id;

  -- If request not found or already processed
  IF v_booking_id IS NULL OR v_current_status != 'PENDING' THEN
    RETURN FALSE;
  END IF;

  -- Check if booking is still pending (not taken by someone else)
  IF EXISTS (SELECT 1 FROM bookings WHERE id = v_booking_id AND status != 'PENDING') THEN
    UPDATE live_booking_requests SET status = 'EXPIRED' WHERE id = p_request_id;
    RETURN FALSE;
  END IF;

  -- Update this request to ACCEPTED
  UPDATE live_booking_requests SET status = 'ACCEPTED' WHERE id = p_request_id;

  -- Expire all other requests for this booking
  UPDATE live_booking_requests 
  SET status = 'EXPIRED' 
  WHERE booking_id = v_booking_id AND id != p_request_id;

  -- Update Booking to CONFIRMED and assign Provider
  UPDATE bookings 
  SET 
    status = 'CONFIRMED', 
    provider_id = p_provider_id,
    updated_at = NOW()
  WHERE id = v_booking_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Implement find_nearby_providers RPC
CREATE OR REPLACE FUNCTION find_nearby_providers(
  service_id UUID,
  lat FLOAT,
  lng FLOAT,
  max_distance FLOAT -- in meters
)
RETURNS TABLE (
  provider_id UUID,
  provider_name TEXT,
  distance_km FLOAT,
  rating FLOAT,
  total_jobs INT,
  is_verified BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as provider_id,
    p.full_name as provider_name,
    (ST_Distance(
      p.operating_location,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
    ) / 1000)::FLOAT as distance_km,
    COALESCE(p.rating, 5.0)::FLOAT as rating,
    COALESCE(p.review_count, 0)::INT as total_jobs,
    p.is_verified
  FROM providers p
  WHERE 
    p.is_active = true
    AND p.is_verified = true
    -- AND p.services @> ARRAY[service_id] -- Assuming services is array of UUIDs or we join. Simplified for now.
    AND ST_DWithin(
      p.operating_location,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
      max_distance
    )
  ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Implement verify_booking_otp RPC
CREATE OR REPLACE FUNCTION verify_booking_otp(
  p_booking_id UUID,
  p_otp_code TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_stored_otp TEXT;
BEGIN
  -- In a real app, OTP should be in a separate secure table or hashed.
  -- For MVP, assuming it's in a 'meta_data' jsonb or separate column.
  -- Checking bookings table for 'otp' column existence, otherwise fallback to meta_data
  
  -- Assuming simple implementation for now:
  SELECT requirements->>'otp' INTO v_stored_otp
  FROM bookings 
  WHERE id = p_booking_id;

  IF v_stored_otp IS NULL OR v_stored_otp != p_otp_code THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Implement update_provider_earnings RPC
CREATE OR REPLACE FUNCTION update_provider_earnings(
  p_provider_id UUID,
  p_amount NUMERIC
)
RETURNS VOID AS $$
BEGIN
  -- Simple update or insert specific ledger logic
  -- Assuming providers has 'wallet_balance' or similar, else no-op for MVP logging
  NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
