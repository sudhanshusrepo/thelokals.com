-- Migration: Update create_ai_booking RPC
-- Description: Updates the booking creation function to support service_category_id and delivery_mode

CREATE OR REPLACE FUNCTION create_ai_booking(
  p_client_id uuid,
  p_service_category text, -- Kept for backward compatibility, but we should prefer ID
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
  v_final_category_id uuid;
  v_final_delivery_mode text;
BEGIN
  -- If ID is not provided, try to look it up from the name
  IF p_service_category_id IS NULL THEN
    SELECT id, type INTO v_final_category_id, v_final_delivery_mode 
    FROM service_categories 
    WHERE name = p_service_category;
  ELSE
    v_final_category_id := p_service_category_id;
    -- If delivery mode is default (LOCAL), try to fetch the correct one from category
    IF p_delivery_mode = 'LOCAL' THEN
       SELECT type INTO v_final_delivery_mode FROM service_categories WHERE id = p_service_category_id;
    ELSE
       v_final_delivery_mode := p_delivery_mode;
    END IF;
  END IF;

  -- Fallback if lookup failed (shouldn't happen if categories match)
  IF v_final_delivery_mode IS NULL THEN
    v_final_delivery_mode := p_delivery_mode;
  END IF;

  INSERT INTO public.bookings (
    client_id,
    service_category,
    service_category_id,
    booking_type,
    requirements,
    ai_checklist,
    estimated_cost,
    location,
    address,
    notes,
    status,
    delivery_mode
  ) VALUES (
    p_client_id,
    p_service_category,
    v_final_category_id,
    'AI_ENHANCED',
    p_requirements,
    p_ai_checklist,
    p_estimated_cost,
    p_location,
    p_address,
    p_notes,
    'PENDING',
    v_final_delivery_mode
  )
  RETURNING id INTO v_booking_id;
  
  RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
