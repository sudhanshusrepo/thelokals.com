-- Fix create_ai_booking to write to booking_requests (Live Booking System)
-- Replaces usage of legacy live_booking_requests

CREATE OR REPLACE FUNCTION public.create_ai_booking(p_user_id uuid, p_service_category text, p_requirements jsonb, p_ai_checklist text[], p_estimated_cost numeric, p_location geography, p_address jsonb, p_notes text DEFAULT NULL::text, p_service_category_id uuid DEFAULT NULL::uuid, p_delivery_mode text DEFAULT 'LOCAL'::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions', 'pg_temp'
AS $function$
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

  -- Create Live Booking Request for nearby providers (Using booking_requests table)
  INSERT INTO public.booking_requests (
    booking_id,
    provider_id,
    status
  )
  SELECT 
    v_booking_id,
    id,
    'PENDING'
  FROM public.providers
  WHERE 
    is_active = true 
    AND is_verified = true
    AND category = p_service_category
    AND ST_DWithin(
      operating_location,
      p_location,
      (COALESCE(service_radius_km, 10) * 1000)
    );
  
  RETURN v_booking_id;
END;
$function$;
