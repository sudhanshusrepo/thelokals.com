-- Migration: Functions and Triggers
-- Description: Database functions for provider matching, booking creation, and automation
-- Phase: 5 of 6

-- ============================================
-- PROVIDER MATCHING FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION find_nearby_providers(
  p_location geography,
  p_category text,
  p_max_distance_km numeric DEFAULT 10,
  p_limit integer DEFAULT 10
)
RETURNS TABLE (
  provider_id uuid,
  provider_name text,
  distance_km numeric,
  rating numeric,
  total_jobs integer,
  is_verified boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    ROUND((ST_Distance(p.operating_location, p_location) / 1000)::numeric, 2) as distance_km,
    p.rating_average,
    p.total_jobs,
    p.is_verified
  FROM public.providers p
  WHERE 
    p.is_active = true
    AND p.category = p_category
    AND ST_DWithin(p.operating_location, p_location, p_max_distance_km * 1000)
  ORDER BY 
    p.is_verified DESC,
    p.rating_average DESC,
    distance_km ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================
-- AI BOOKING CREATION FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION create_ai_booking(
  p_client_id uuid,
  p_service_category text,
  p_requirements jsonb,
  p_ai_checklist text[],
  p_estimated_cost numeric,
  p_location geography,
  p_address jsonb,
  p_notes text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_booking_id uuid;
BEGIN
  INSERT INTO public.bookings (
    client_id,
    service_category,
    booking_type,
    requirements,
    ai_checklist,
    estimated_cost,
    location,
    address,
    notes,
    status
  ) VALUES (
    p_client_id,
    p_service_category,
    'AI_ENHANCED',
    p_requirements,
    p_ai_checklist,
    p_estimated_cost,
    p_location,
    p_address,
    p_notes,
    'PENDING'
  )
  RETURNING id INTO v_booking_id;
  
  RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- LIVE BOOKING REQUEST BROADCAST FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION broadcast_live_booking(
  p_booking_id uuid,
  p_provider_ids uuid[],
  p_expiry_minutes integer DEFAULT 1
)
RETURNS integer AS $$
DECLARE
  v_provider_id uuid;
  v_count integer := 0;
  v_expires_at timestamptz;
BEGIN
  v_expires_at := now() + (p_expiry_minutes || ' minutes')::interval;
  
  FOREACH v_provider_id IN ARRAY p_provider_ids
  LOOP
    INSERT INTO public.live_booking_requests (
      booking_id,
      provider_id,
      status,
      expires_at
    ) VALUES (
      p_booking_id,
      v_provider_id,
      'PENDING',
      v_expires_at
    )
    ON CONFLICT (booking_id, provider_id) DO NOTHING;
    
    v_count := v_count + 1;
  END LOOP;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ACCEPT LIVE BOOKING FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION accept_live_booking(
  p_request_id uuid,
  p_provider_id uuid
)
RETURNS boolean AS $$
DECLARE
  v_booking_id uuid;
  v_request_status request_status;
BEGIN
  -- Get booking ID and check request status
  SELECT booking_id, status 
  INTO v_booking_id, v_request_status
  FROM public.live_booking_requests
  WHERE id = p_request_id AND provider_id = p_provider_id;
  
  -- Check if request is still pending
  IF v_request_status != 'PENDING' THEN
    RETURN false;
  END IF;
  
  -- Update the request to accepted
  UPDATE public.live_booking_requests
  SET 
    status = 'ACCEPTED',
    responded_at = now()
  WHERE id = p_request_id;
  
  -- Assign provider to booking
  UPDATE public.bookings
  SET 
    provider_id = p_provider_id,
    status = 'CONFIRMED',
    updated_at = now()
  WHERE id = v_booking_id;
  
  -- Reject all other pending requests for this booking
  UPDATE public.live_booking_requests
  SET 
    status = 'REJECTED',
    responded_at = now()
  WHERE 
    booking_id = v_booking_id 
    AND id != p_request_id 
    AND status = 'PENDING';
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GENERATE AND SEND OTP FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION generate_booking_otp(
  p_booking_id uuid
)
RETURNS text AS $$
DECLARE
  v_otp text;
  v_expires_at timestamptz;
BEGIN
  -- Generate 6-digit OTP
  v_otp := LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0');
  v_expires_at := now() + interval '15 minutes';
  
  -- Insert OTP
  INSERT INTO public.booking_otp (
    booking_id,
    otp_code,
    expires_at
  ) VALUES (
    p_booking_id,
    v_otp,
    v_expires_at
  );
  
  RETURN v_otp;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VERIFY OTP FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION verify_booking_otp(
  p_booking_id uuid,
  p_otp_code text
)
RETURNS boolean AS $$
DECLARE
  v_otp_id uuid;
  v_is_valid boolean := false;
BEGIN
  -- Check if OTP is valid
  SELECT id INTO v_otp_id
  FROM public.booking_otp
  WHERE 
    booking_id = p_booking_id
    AND otp_code = p_otp_code
    AND is_verified = false
    AND expires_at > now();
  
  IF v_otp_id IS NOT NULL THEN
    -- Mark OTP as verified
    UPDATE public.booking_otp
    SET 
      is_verified = true,
      verified_at = now()
    WHERE id = v_otp_id;
    
    -- Update booking status to in progress
    UPDATE public.bookings
    SET 
      status = 'IN_PROGRESS',
      started_at = now(),
      updated_at = now()
    WHERE id = p_booking_id;
    
    v_is_valid := true;
  END IF;
  
  RETURN v_is_valid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMPLETE BOOKING FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION complete_booking(
  p_booking_id uuid,
  p_final_cost numeric
)
RETURNS boolean AS $$
BEGIN
  UPDATE public.bookings
  SET 
    status = 'COMPLETED',
    final_cost = p_final_cost,
    completed_at = now(),
    updated_at = now()
  WHERE id = p_booking_id AND status = 'IN_PROGRESS';
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
