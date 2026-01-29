
-- Migration: Add service_category_id and delivery_mode to bookings
-- Date: 2025-12-15

-- 1. Add missing columns to bookings
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS service_category_id uuid REFERENCES public.service_categories(id),
ADD COLUMN IF NOT EXISTS delivery_mode text DEFAULT 'LOCAL';

-- 2. Drop old function (cascade to drop dependents if any)
DROP FUNCTION IF EXISTS public.create_ai_booking(uuid, text, jsonb, text[], numeric, geography, jsonb, text) CASCADE;
DROP FUNCTION IF EXISTS public.create_ai_booking(uuid, text, jsonb, text[], numeric, geography, jsonb, text, uuid, text) CASCADE;

-- 3. Recreate function with correct signature (10 args)
CREATE OR REPLACE FUNCTION public.create_ai_booking(
  p_user_id uuid,
  p_service_category text,
  p_requirements jsonb,
  p_ai_checklist text[],
  p_estimated_cost numeric,
  p_location geography,
  p_address jsonb,
  p_notes text DEFAULT NULL,
  p_service_category_id uuid DEFAULT NULL,
  p_delivery_mode text DEFAULT 'LOCAL'
)
RETURNS uuid AS $$
DECLARE
  v_booking_id uuid;
BEGIN
  -- Insert booking
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
    status,
    service_category_id,
    delivery_mode
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
    'PENDING',
    p_service_category_id,
    p_delivery_mode
  )
  RETURNING id INTO v_booking_id;

  -- Create Live Booking Request for nearby providers
  INSERT INTO public.live_booking_requests (
    booking_id,
    provider_id,
    status,
    expires_at
  )
  SELECT 
    v_booking_id,
    id,
    'PENDING',
    now() + interval '10 minutes'
  FROM public.providers
  WHERE 
    is_active = true 
    AND is_verified = true
    AND category = p_service_category
    AND ST_DWithin(
      operating_location,
      p_location,
      (COALESCE(service_radius_km, 10) * 1000) -- Convert km to meters
    );

  RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
