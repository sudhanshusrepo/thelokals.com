-- 02_booking_system.sql
-- Booking System: Bookings, Lifecycle, Requests, OTP, Reviews

-- 1. Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id uuid REFERENCES auth.users NOT NULL,
  provider_id uuid REFERENCES public.providers,
  service_category text NOT NULL,
  booking_type booking_type DEFAULT 'SCHEDULED',
  status booking_status DEFAULT 'PENDING',
  
  -- User requirements and AI data
  requirements jsonb,
  ai_checklist text[],
  estimated_cost numeric(10, 2),
  final_cost numeric(10, 2),
  
  -- Scheduling
  scheduled_date timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  
  -- Location
  location geography(Point, 4326),
  address jsonb,
  
  -- Additional info
  notes text,
  payment_status payment_status DEFAULT 'PENDING',
  
  -- Lifecycle Extensions
  service_mode text CHECK (service_mode IN ('local', 'online')),
  input_method text CHECK (input_method IN ('voice', 'text', 'form')),
  voice_transcript text,
  estimated_price_min decimal(10,2),
  estimated_price_max decimal(10,2),
  estimated_duration_min integer,
  estimated_duration_max integer,
  preferred_time timestamptz,
  urgency text CHECK (urgency IN ('low', 'normal', 'high', 'emergency')),
  ai_classification jsonb,
  pricing_breakdown jsonb,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Booking Lifecycle Events
CREATE TABLE IF NOT EXISTS public.booking_lifecycle_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id uuid REFERENCES public.bookings(id) ON DELETE CASCADE,
  phase text NOT NULL CHECK (phase IN ('REQUEST', 'MATCH', 'CONFIRM', 'EXECUTE', 'COMPLETE', 'REVIEW')),
  event_type text NOT NULL,
  event_data jsonb,
  created_at timestamptz DEFAULT now()
);

-- 3. Live Booking Requests
CREATE TABLE IF NOT EXISTS public.live_booking_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id uuid REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  provider_id uuid REFERENCES public.providers(id) ON DELETE CASCADE NOT NULL,
  status request_status DEFAULT 'PENDING',
  expires_at timestamptz NOT NULL,
  responded_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(booking_id, provider_id)
);

-- 4. Booking OTP
CREATE TABLE IF NOT EXISTS public.booking_otp (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id uuid REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  otp_code text NOT NULL,
  is_verified boolean DEFAULT false,
  verified_at timestamptz,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 5. Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id uuid REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL UNIQUE,
  client_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  provider_id uuid REFERENCES public.providers(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_bookings_client ON public.bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider ON public.bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_bookings_location ON public.bookings USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_bookings_service_mode ON public.bookings(service_mode);
CREATE INDEX IF NOT EXISTS idx_bookings_urgency ON public.bookings(urgency) WHERE urgency IN ('high', 'emergency');

CREATE INDEX IF NOT EXISTS idx_lifecycle_events_booking ON public.booking_lifecycle_events(booking_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lifecycle_events_phase ON public.booking_lifecycle_events(phase, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_live_requests_provider ON public.live_booking_requests(provider_id);
CREATE INDEX IF NOT EXISTS idx_live_requests_booking ON public.live_booking_requests(booking_id);

CREATE INDEX IF NOT EXISTS idx_booking_otp_booking ON public.booking_otp(booking_id);

CREATE INDEX IF NOT EXISTS idx_reviews_provider ON public.reviews(provider_id);
CREATE INDEX IF NOT EXISTS idx_reviews_client ON public.reviews(client_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking ON public.reviews(booking_id);

-- 7. Functions

-- Create AI Booking
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

-- Broadcast Live Booking
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

-- Accept Live Booking
CREATE OR REPLACE FUNCTION accept_live_booking(
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Generate OTP
CREATE OR REPLACE FUNCTION generate_booking_otp(
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify OTP
CREATE OR REPLACE FUNCTION verify_booking_otp(
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Complete Booking
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

-- Update Provider Rating
CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.providers
  SET 
    rating_average = (
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM public.reviews
      WHERE provider_id = NEW.provider_id
    ),
    updated_at = now()
  WHERE id = NEW.provider_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Log Lifecycle Event
CREATE OR REPLACE FUNCTION log_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    INSERT INTO public.booking_lifecycle_events (booking_id, phase, event_type, event_data)
    VALUES (
      NEW.id,
      CASE 
        WHEN NEW.status = 'PENDING' THEN 'REQUEST' -- Adjusted mapping
        WHEN NEW.status = 'CONFIRMED' THEN 'MATCH'
        WHEN NEW.status = 'IN_PROGRESS' THEN 'EXECUTE'
        WHEN NEW.status = 'COMPLETED' THEN 'COMPLETE'
        WHEN NEW.status = 'CANCELLED' THEN 'COMPLETE'
        ELSE 'REQUEST'
      END,
      'status_changed',
      jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Triggers
DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at 
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON public.reviews;
CREATE TRIGGER update_reviews_updated_at 
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_provider_rating_on_review_insert ON public.reviews;
CREATE TRIGGER update_provider_rating_on_review_insert
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_provider_rating();

DROP TRIGGER IF EXISTS update_provider_rating_on_review_update ON public.reviews;
CREATE TRIGGER update_provider_rating_on_review_update
  AFTER UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_provider_rating();

DROP TRIGGER IF EXISTS update_provider_rating_on_review_delete ON public.reviews;
CREATE TRIGGER update_provider_rating_on_review_delete
  AFTER DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_provider_rating();

DROP TRIGGER IF EXISTS booking_status_change_trigger ON public.bookings;
CREATE TRIGGER booking_status_change_trigger
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION log_booking_status_change();

-- 9. RLS Policies
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_lifecycle_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_otp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Bookings Policies
DROP POLICY IF EXISTS "bookings_select_own_client" ON public.bookings;
CREATE POLICY "bookings_select_own_client" ON public.bookings
  FOR SELECT USING (auth.uid() = client_id);

DROP POLICY IF EXISTS "bookings_select_own_provider" ON public.bookings;
CREATE POLICY "bookings_select_own_provider" ON public.bookings
  FOR SELECT USING (auth.uid() = provider_id);

DROP POLICY IF EXISTS "bookings_insert_own" ON public.bookings;
CREATE POLICY "bookings_insert_own" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = client_id);

DROP POLICY IF EXISTS "bookings_update_own_client" ON public.bookings;
CREATE POLICY "bookings_update_own_client" ON public.bookings
  FOR UPDATE USING (
    auth.uid() = client_id 
    AND status IN ('PENDING', 'CONFIRMED')
  );

DROP POLICY IF EXISTS "bookings_update_own_provider" ON public.bookings;
CREATE POLICY "bookings_update_own_provider" ON public.bookings
  FOR UPDATE USING (auth.uid() = provider_id);

-- Live Booking Requests Policies
DROP POLICY IF EXISTS "live_requests_select_own" ON public.live_booking_requests;
CREATE POLICY "live_requests_select_own" ON public.live_booking_requests
  FOR SELECT USING (auth.uid() = provider_id);

DROP POLICY IF EXISTS "live_requests_insert_service" ON public.live_booking_requests;
CREATE POLICY "live_requests_insert_service" ON public.live_booking_requests
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "live_requests_update_own" ON public.live_booking_requests;
CREATE POLICY "live_requests_update_own" ON public.live_booking_requests
  FOR UPDATE USING (
    auth.uid() = provider_id 
    AND status = 'PENDING'
  );

-- Booking OTP Policies
DROP POLICY IF EXISTS "booking_otp_select_client" ON public.booking_otp;
CREATE POLICY "booking_otp_select_client" ON public.booking_otp
  FOR SELECT USING (
    auth.uid() = (SELECT client_id FROM public.bookings WHERE id = booking_id)
  );

DROP POLICY IF EXISTS "booking_otp_select_provider" ON public.booking_otp;
CREATE POLICY "booking_otp_select_provider" ON public.booking_otp
  FOR SELECT USING (
    auth.uid() = (SELECT provider_id FROM public.bookings WHERE id = booking_id)
  );

DROP POLICY IF EXISTS "booking_otp_insert_service" ON public.booking_otp;
CREATE POLICY "booking_otp_insert_service" ON public.booking_otp
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "booking_otp_update_provider" ON public.booking_otp;
CREATE POLICY "booking_otp_update_provider" ON public.booking_otp
  FOR UPDATE USING (
    auth.uid() = (SELECT provider_id FROM public.bookings WHERE id = booking_id)
  );

-- Reviews Policies
DROP POLICY IF EXISTS "reviews_select_all" ON public.reviews;
CREATE POLICY "reviews_select_all" ON public.reviews
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "reviews_insert_own" ON public.reviews;
CREATE POLICY "reviews_insert_own" ON public.reviews
  FOR INSERT WITH CHECK (
    auth.uid() = client_id 
    AND (SELECT status FROM public.bookings WHERE id = booking_id) = 'COMPLETED'
  );

DROP POLICY IF EXISTS "reviews_update_own" ON public.reviews;
CREATE POLICY "reviews_update_own" ON public.reviews
  FOR UPDATE USING (
    auth.uid() = client_id 
    AND created_at > now() - interval '24 hours'
  );

-- Grant Permissions
GRANT ALL ON public.bookings TO authenticated;
GRANT ALL ON public.booking_lifecycle_events TO authenticated;
GRANT ALL ON public.live_booking_requests TO authenticated;
GRANT ALL ON public.booking_otp TO authenticated;
GRANT ALL ON public.reviews TO authenticated;
