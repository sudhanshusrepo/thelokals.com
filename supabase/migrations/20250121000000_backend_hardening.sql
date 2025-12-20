-- ============================================
-- THELOKALS.COM - BACKEND HARDENING
-- ============================================
-- Version: 1.0
-- Date: 2025-01-21
-- Description: Security hardening, data integrity constraints, and scalability indexes.
-- ============================================

-- ============================================
-- 1. SECURITY: FIX SEARCH_PATH IN SECURITY DEFINER FUNCTIONS
-- ============================================

-- Fix find_nearby_providers
CREATE OR REPLACE FUNCTION public.find_nearby_providers(
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
    ROUND((st_distance(p.operating_location, p_location) / 1000)::numeric, 2) as distance_km,
    p.rating_average,
    p.total_jobs,
    p.is_verified
  FROM public.providers p
  WHERE 
    p.is_active = true
    AND p.category = p_category
    AND st_dwithin(p.operating_location, p_location, p_max_distance_km * 1000)
  ORDER BY 
    p.is_verified DESC,
    p.rating_average DESC,
    distance_km ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, extensions, pg_temp;

-- Fix create_ai_booking
CREATE OR REPLACE FUNCTION public.create_ai_booking(
  p_user_id uuid,
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
    user_id,
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
    p_user_id,
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions, pg_temp;

-- Fix broadcast_live_booking
CREATE OR REPLACE FUNCTION public.broadcast_live_booking(
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions, pg_temp;

-- Fix accept_live_booking
CREATE OR REPLACE FUNCTION public.accept_live_booking(
  p_request_id uuid,
  p_provider_id uuid
)
RETURNS boolean AS $$
DECLARE
  v_booking_id uuid;
  v_request_status request_status;
BEGIN
  SELECT booking_id, status 
  INTO v_booking_id, v_request_status
  FROM public.live_booking_requests
  WHERE id = p_request_id AND provider_id = p_provider_id;
  
  IF v_request_status != 'PENDING' THEN
    RETURN false;
  END IF;
  
  UPDATE public.live_booking_requests
  SET 
    status = 'ACCEPTED',
    responded_at = now()
  WHERE id = p_request_id;
  
  UPDATE public.bookings
  SET 
    provider_id = p_provider_id,
    status = 'CONFIRMED',
    updated_at = now()
  WHERE id = v_booking_id;
  
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions, pg_temp;

-- Fix generate_booking_otp
CREATE OR REPLACE FUNCTION public.generate_booking_otp(
  p_booking_id uuid
)
RETURNS text AS $$
DECLARE
  v_otp text;
  v_expires_at timestamptz;
BEGIN
  v_otp := LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0');
  v_expires_at := now() + interval '15 minutes';
  
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions, pg_temp;

-- Fix verify_booking_otp
CREATE OR REPLACE FUNCTION public.verify_booking_otp(
  p_booking_id uuid,
  p_otp_code text
)
RETURNS boolean AS $$
DECLARE
  v_otp_id uuid;
  v_is_valid boolean := false;
BEGIN
  SELECT id INTO v_otp_id
  FROM public.booking_otp
  WHERE 
    booking_id = p_booking_id
    AND otp_code = p_otp_code
    AND is_verified = false
    AND expires_at > now();
  
  IF v_otp_id IS NOT NULL THEN
    UPDATE public.booking_otp
    SET 
      is_verified = true,
      verified_at = now()
    WHERE id = v_otp_id;
    
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions, pg_temp;

-- Fix complete_booking
CREATE OR REPLACE FUNCTION public.complete_booking(
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions, pg_temp;

-- Fix request_account_deletion
CREATE OR REPLACE FUNCTION public.request_account_deletion(reason TEXT)
RETURNS UUID AS $$
DECLARE
    request_id UUID;
BEGIN
    INSERT INTO public.account_deletion_requests (user_id, reason)
    VALUES (auth.uid(), reason)
    RETURNING id INTO request_id;
    
    RETURN request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions, pg_temp;

-- Fix report_content
CREATE OR REPLACE FUNCTION public.report_content(
    reported_user_id UUID,
    content_type TEXT,
    content_id UUID,
    reason TEXT,
    description TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    report_id UUID;
BEGIN
    INSERT INTO public.user_reports (reporter_id, reported_user_id, content_type, content_id, reason, description)
    VALUES (auth.uid(), reported_user_id, content_type, content_id, reason, description)
    RETURNING id INTO report_id;
    
    RETURN report_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions, pg_temp;

-- Fix block_user
CREATE OR REPLACE FUNCTION public.block_user(blocked_user_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.user_blocks (blocker_id, blocked_id)
    VALUES (auth.uid(), blocked_user_id)
    ON CONFLICT (blocker_id, blocked_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions, pg_temp;

-- Fix unblock_user
CREATE OR REPLACE FUNCTION public.unblock_user(blocked_user_id UUID)
RETURNS VOID AS $$
BEGIN
    DELETE FROM public.user_blocks
    WHERE blocker_id = auth.uid() AND blocked_id = blocked_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions, pg_temp;

-- ============================================
-- 2. DATA INTEGRITY: CONSTRAINTS & TRIGGERS
-- ============================================

-- Bookings JSON Validation
ALTER TABLE public.bookings
  ADD CONSTRAINT check_requirements_is_object CHECK (jsonb_typeof(requirements) = 'object');

-- Profiles Address Validation
ALTER TABLE public.profiles
  ADD CONSTRAINT check_address_is_object CHECK (jsonb_typeof(address) = 'object');

-- Prevent Invalid Status Transitions
CREATE OR REPLACE FUNCTION public.check_booking_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent going back to PENDING from anything
  IF OLD.status != 'PENDING' AND NEW.status = 'PENDING' THEN
    RAISE EXCEPTION 'Cannot revert booking status to PENDING from %', OLD.status;
  END IF;
  
  -- Prevent going back to CONFIRMED from IN_PROGRESS or COMPLETED
  IF OLD.status IN ('IN_PROGRESS', 'COMPLETED') AND NEW.status = 'CONFIRMED' THEN
    RAISE EXCEPTION 'Cannot revert booking status to CONFIRMED from %', OLD.status;
  END IF;
  
  -- Prevent updates to COMPLETED bookings (except for refunds which might be handled differently, but here we assume immutable)
  IF OLD.status = 'COMPLETED' AND NEW.status != 'COMPLETED' THEN
     RAISE EXCEPTION 'Cannot change status of a COMPLETED booking';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_invalid_booking_transitions
  BEFORE UPDATE OF status ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.check_booking_status_transition();

-- ============================================
-- 3. SCALABILITY: PARTIAL INDEXES
-- ============================================

-- Active Provider Index (Commonly queried for finding pros)
CREATE INDEX IF NOT EXISTS idx_providers_active_partial 
  ON public.providers(operating_location) 
  WHERE is_active = true AND is_verified = true;

-- Pending Bookings Index (For provider feeds/notifications)
CREATE INDEX IF NOT EXISTS idx_bookings_pending_partial 
  ON public.bookings(created_at DESC) 
  WHERE status = 'PENDING';

-- Active Live Requests (For expiration checks and polling)
CREATE INDEX IF NOT EXISTS idx_live_requests_pending_partial 
  ON public.live_booking_requests(created_at) 
  WHERE status = 'PENDING';

