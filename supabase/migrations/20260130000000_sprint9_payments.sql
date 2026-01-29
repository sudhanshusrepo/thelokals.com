-- Sprint 9: Payments and Reviews
-- Goal: Mock payment processing and Rating/Review system

BEGIN;

-- 1. Ensure columns exist on providers (Idempotent)
ALTER TABLE providers ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) DEFAULT 0;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- 2. Create Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    worker_id UUID NOT NULL REFERENCES providers(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(booking_id) -- One review per booking
);

-- 3. RPC: Process Payment (Mock)
CREATE OR REPLACE FUNCTION process_payment(
  p_booking_id UUID,
  p_amount NUMERIC,
  p_method TEXT -- 'CARD', 'UPI', 'CASH'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_status TEXT;
  v_client_id UUID;
BEGIN
  -- Validate Booking
  SELECT status::TEXT, user_id INTO v_status, v_client_id
  FROM bookings
  WHERE id = p_booking_id;

  IF v_status != 'COMPLETED' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Booking must be COMPLETED to process payment');
  END IF;

  -- Update Booking
  UPDATE bookings
  SET 
    payment_status = 'PAID',
    final_cost = p_amount,
    updated_at = NOW()
  WHERE id = p_booking_id;

  -- TODO: Create Transaction Record (out of scope for MVP)

  RETURN jsonb_build_object('success', true, 'message', 'Payment processed successfully');
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;


-- 4. RPC: Submit Review
CREATE OR REPLACE FUNCTION submit_review(
  p_booking_id UUID,
  p_rating INTEGER,
  p_comment TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking RECORD;
  v_provider_id UUID;
  v_old_rating NUMERIC;
  v_old_count INTEGER;
  v_new_rating NUMERIC;
  v_exists BOOLEAN;
BEGIN
  -- Check if review already exists
  SELECT EXISTS(SELECT 1 FROM reviews WHERE booking_id = p_booking_id) INTO v_exists;
  IF v_exists THEN
    RETURN jsonb_build_object('success', false, 'message', 'Review already exists for this booking');
  END IF;

  -- Get Booking Details
  SELECT * INTO v_booking FROM bookings WHERE id = p_booking_id;
  v_provider_id := v_booking.provider_id;

  IF v_provider_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'No provider assigned to this booking');
  END IF;

  -- Insert Review
  INSERT INTO reviews (booking_id, user_id, worker_id, rating, comment, created_at)
  VALUES (p_booking_id, auth.uid(), v_provider_id, p_rating, p_comment, NOW());

  -- Update Provider Stats
  SELECT rating, review_count INTO v_old_rating, v_old_count
  FROM providers
  WHERE id = v_provider_id;

  -- Handle NULLs
  v_old_rating := COALESCE(v_old_rating, 0);
  v_old_count := COALESCE(v_old_count, 0);

  -- Calculate New Weighted Average
  v_new_rating := ((v_old_rating * v_old_count) + p_rating) / (v_old_count + 1);

  -- Update Provider
  UPDATE providers
  SET 
    rating = v_new_rating,
    review_count = v_old_count + 1
  WHERE id = v_provider_id;

  RETURN jsonb_build_object('success', true, 'message', 'Review submitted successfully');
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;

COMMIT;
