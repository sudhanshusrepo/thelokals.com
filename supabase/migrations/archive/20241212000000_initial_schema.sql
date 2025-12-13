-- ============================================
-- THELOKALS.COM - COMPLETE DATABASE SETUP
-- ============================================
-- Version: 1.0
-- Date: 2025-12-01
-- Description: Consolidated database setup script combining all migrations
-- Usage: Execute this entire script in Supabase SQL Editor for fresh database setup
-- 
-- IMPORTANT: This script will DROP all existing tables and data!
-- Only run this on a fresh database or when you want to completely reset.
-- ============================================

-- ============================================
-- PART 1: CLEANUP & PREPARATION
-- ============================================

-- Drop all tables in reverse dependency order
DROP TABLE IF EXISTS public.account_deletion_requests CASCADE;
DROP TABLE IF EXISTS public.user_reports CASCADE;
DROP TABLE IF EXISTS public.user_blocks CASCADE;
DROP TABLE IF EXISTS public.admin_activity_logs CASCADE;
DROP TABLE IF EXISTS public.admin_users CASCADE;
DROP TABLE IF EXISTS public.user_offers CASCADE;
DROP TABLE IF EXISTS public.offers CASCADE;
DROP TABLE IF EXISTS public.provider_earnings CASCADE;
DROP TABLE IF EXISTS public.provider_availability CASCADE;
DROP TABLE IF EXISTS public.provider_notifications CASCADE;
DROP TABLE IF EXISTS public.provider_stats CASCADE;
DROP TABLE IF EXISTS public.provider_pins CASCADE;
DROP TABLE IF EXISTS public.payment_refunds CASCADE;
DROP TABLE IF EXISTS public.payment_transactions CASCADE;
DROP TABLE IF EXISTS public.payment_methods CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.booking_otp CASCADE;
DROP TABLE IF EXISTS public.live_booking_requests CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.providers CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.service_categories CASCADE;

-- Drop all custom types
DROP TYPE IF EXISTS booking_status CASCADE;
DROP TYPE IF EXISTS booking_type CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS request_status CASCADE;
DROP TYPE IF EXISTS payment_method_type CASCADE;
DROP TYPE IF EXISTS refund_status CASCADE;
DROP TYPE IF EXISTS admin_role CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS find_nearby_providers(geography, text, numeric, integer) CASCADE;
DROP FUNCTION IF EXISTS create_ai_booking(uuid, text, jsonb, text[], numeric, geography, jsonb, text) CASCADE;
DROP FUNCTION IF EXISTS broadcast_live_booking(uuid, uuid[], integer) CASCADE;
DROP FUNCTION IF EXISTS accept_live_booking(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS generate_booking_otp(uuid) CASCADE;
DROP FUNCTION IF EXISTS verify_booking_otp(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS complete_booking(uuid, numeric) CASCADE;
DROP FUNCTION IF EXISTS update_provider_rating() CASCADE;
DROP FUNCTION IF EXISTS request_account_deletion(text) CASCADE;
DROP FUNCTION IF EXISTS report_content(uuid, text, uuid, text, text) CASCADE;
DROP FUNCTION IF EXISTS block_user(uuid) CASCADE;
DROP FUNCTION IF EXISTS unblock_user(uuid) CASCADE;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================
-- PART 2: CORE SCHEMA - ENUMS & TYPES
-- ============================================

-- Booking related enums
CREATE TYPE booking_status AS ENUM (
  'PENDING',
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED'
);

CREATE TYPE booking_type AS ENUM (
  'AI_ENHANCED',
  'LIVE',
  'SCHEDULED'
);

CREATE TYPE payment_status AS ENUM (
  'PENDING',
  'PAID',
  'REFUNDED',
  'FAILED'
);

CREATE TYPE request_status AS ENUM (
  'PENDING',
  'ACCEPTED',
  'REJECTED',
  'EXPIRED'
);

-- Payment related enums
CREATE TYPE payment_method_type AS ENUM (
  'CARD',
  'UPI',
  'NETBANKING',
  'WALLET',
  'CASH'
);

CREATE TYPE refund_status AS ENUM (
  'PENDING',
  'APPROVED',
  'REJECTED',
  'PROCESSED'
);

-- Admin related enums
CREATE TYPE admin_role AS ENUM (
  'SUPER_ADMIN',
  'ADMIN',
  'MODERATOR',
  'SUPPORT'
);

-- ============================================
-- PART 3: CORE TABLES
-- ============================================

-- Service Categories Table
CREATE TABLE public.service_categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  group_name text NOT NULL,
  icon text,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Profiles Table (Customer profiles)
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
  full_name text,
  phone text,
  email text,
  avatar_url text,
  address jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Providers Table (Service providers)
CREATE TABLE public.providers (
  id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
  full_name text NOT NULL,
  phone text,
  email text,
  category text NOT NULL,
  experience_years integer DEFAULT 0,
  operating_location geography(Point, 4326),
  service_radius_km numeric DEFAULT 10,
  is_verified boolean DEFAULT false,
  is_active boolean DEFAULT true,
  rating_average numeric(3, 2) DEFAULT 0.0,
  total_jobs integer DEFAULT 0,
  total_earnings numeric(10, 2) DEFAULT 0,
  profile_image_url text,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- PART 4: BOOKING SYSTEM TABLES
-- ============================================

-- Bookings Table
CREATE TABLE public.bookings (
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
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Live Booking Requests Table
CREATE TABLE public.live_booking_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id uuid REFERENCES public.bookings ON DELETE CASCADE NOT NULL,
  provider_id uuid REFERENCES public.providers ON DELETE CASCADE NOT NULL,
  status request_status DEFAULT 'PENDING',
  expires_at timestamptz NOT NULL,
  responded_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(booking_id, provider_id)
);

-- Booking OTP Table
CREATE TABLE public.booking_otp (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id uuid REFERENCES public.bookings ON DELETE CASCADE NOT NULL,
  otp_code text NOT NULL,
  is_verified boolean DEFAULT false,
  verified_at timestamptz,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- PART 5: REVIEWS & RATINGS TABLES
-- ============================================

-- Reviews Table
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id uuid REFERENCES public.bookings ON DELETE CASCADE NOT NULL UNIQUE,
  client_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  provider_id uuid REFERENCES public.providers ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- PART 6: PAYMENT SYSTEM TABLES
-- ============================================

-- Payment Methods Table
CREATE TABLE public.payment_methods (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  method_type payment_method_type NOT NULL,
  is_default boolean DEFAULT false,
  details jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Payment Transactions Table
CREATE TABLE public.payment_transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id uuid REFERENCES public.bookings ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  amount numeric(10, 2) NOT NULL,
  payment_method_id uuid REFERENCES public.payment_methods,
  status payment_status DEFAULT 'PENDING',
  gateway_transaction_id text,
  gateway_response jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Payment Refunds Table
CREATE TABLE public.payment_refunds (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id uuid REFERENCES public.payment_transactions ON DELETE CASCADE NOT NULL,
  amount numeric(10, 2) NOT NULL,
  reason text,
  status refund_status DEFAULT 'PENDING',
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- PART 7: PROVIDER APP FEATURES TABLES
-- ============================================

-- Provider Availability Table
CREATE TABLE public.provider_availability (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id uuid REFERENCES public.providers ON DELETE CASCADE NOT NULL,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Provider Earnings Table
CREATE TABLE public.provider_earnings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id uuid REFERENCES public.providers ON DELETE CASCADE NOT NULL,
  booking_id uuid REFERENCES public.bookings ON DELETE CASCADE,
  client_id uuid REFERENCES public.profiles ON DELETE CASCADE,
  amount numeric(10, 2) NOT NULL,
  commission numeric(10, 2) DEFAULT 0,
  net_amount numeric(10, 2) NOT NULL,
  payment_status payment_status DEFAULT 'PENDING',
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Provider Notifications Table
CREATE TABLE public.provider_notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id uuid REFERENCES public.providers ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text,
  is_read boolean DEFAULT false,
  data jsonb,
  created_at timestamptz DEFAULT now()
);

-- Provider Stats Table
CREATE TABLE public.provider_stats (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id uuid REFERENCES public.providers ON DELETE CASCADE NOT NULL UNIQUE,
  total_bookings integer DEFAULT 0,
  completed_bookings integer DEFAULT 0,
  cancelled_bookings integer DEFAULT 0,
  total_revenue numeric(10, 2) DEFAULT 0,
  average_rating numeric(3, 2) DEFAULT 0,
  response_time_avg interval,
  last_active_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Provider PIN Verification Table
CREATE TABLE public.provider_pins (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id uuid REFERENCES public.providers ON DELETE CASCADE NOT NULL UNIQUE,
  pin_hash text NOT NULL,
  is_active boolean DEFAULT true,
  failed_attempts integer DEFAULT 0,
  locked_until timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- PART 8: OFFERS & PROMOTIONS TABLES
-- ============================================

-- Offers Table
CREATE TABLE public.offers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  discount_type text NOT NULL CHECK (discount_type IN ('PERCENTAGE', 'FIXED')),
  discount_value numeric(10, 2) NOT NULL,
  min_order_value numeric(10, 2),
  max_discount numeric(10, 2),
  code text UNIQUE,
  valid_from timestamptz NOT NULL,
  valid_until timestamptz NOT NULL,
  usage_limit integer,
  usage_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User Offers Table (tracks which users have used which offers)
CREATE TABLE public.user_offers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  offer_id uuid REFERENCES public.offers ON DELETE CASCADE,
  used_at timestamptz DEFAULT now(),
  booking_id uuid REFERENCES public.bookings ON DELETE SET NULL
);

-- ============================================
-- PART 9: ADMIN SYSTEM TABLES
-- ============================================

-- Admin Users Table
CREATE TABLE public.admin_users (
  id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
  role admin_role DEFAULT 'SUPPORT',
  permissions jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Admin Activity Logs Table
CREATE TABLE public.admin_activity_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id uuid REFERENCES public.admin_users ON DELETE CASCADE NOT NULL,
  action text NOT NULL,
  target_type text,
  target_id uuid,
  details jsonb,
  ip_address inet,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- PART 10: PLAY STORE COMPLIANCE TABLES
-- ============================================

-- Account Deletion Requests Table
CREATE TABLE public.account_deletion_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  reason text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User Reports Table (for UGC moderation)
CREATE TABLE public.user_reports (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  reported_user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('profile', 'service', 'review', 'chat', 'other')),
  content_id uuid,
  reason text NOT NULL,
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User Blocks Table
CREATE TABLE public.user_blocks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  blocked_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

-- ============================================
-- PART 11: INDEXES
-- ============================================

-- Service Categories Indexes
CREATE INDEX idx_service_categories_group ON public.service_categories(group_name);
CREATE INDEX idx_service_categories_active ON public.service_categories(is_active);

-- Providers Indexes
CREATE INDEX idx_providers_location ON public.providers USING GIST (operating_location);
CREATE INDEX idx_providers_category ON public.providers(category);
CREATE INDEX idx_providers_active ON public.providers(is_active, is_verified);
CREATE INDEX idx_providers_rating ON public.providers(rating_average DESC);

-- Bookings Indexes
CREATE INDEX idx_bookings_client ON public.bookings(client_id);
CREATE INDEX idx_bookings_provider ON public.bookings(provider_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_date ON public.bookings(scheduled_date);
CREATE INDEX idx_bookings_location ON public.bookings USING GIST (location);

-- Live Requests Indexes
CREATE INDEX idx_live_requests_provider ON public.live_booking_requests(provider_id);
CREATE INDEX idx_live_requests_booking ON public.live_booking_requests(booking_id);
CREATE INDEX idx_live_requests_expires ON public.live_booking_requests(expires_at);

-- Booking OTP Indexes
CREATE INDEX idx_booking_otp_booking ON public.booking_otp(booking_id);
CREATE INDEX idx_booking_otp_code ON public.booking_otp(otp_code);

-- Reviews Indexes
CREATE INDEX idx_reviews_provider ON public.reviews(provider_id);
CREATE INDEX idx_reviews_client ON public.reviews(client_id);
CREATE INDEX idx_reviews_booking ON public.reviews(booking_id);

-- Payment Indexes
CREATE INDEX idx_payment_transactions_booking ON public.payment_transactions(booking_id);
CREATE INDEX idx_payment_transactions_user ON public.payment_transactions(user_id);
CREATE INDEX idx_payment_methods_user ON public.payment_methods(user_id);

-- Provider Features Indexes
CREATE INDEX idx_provider_earnings_provider ON public.provider_earnings(provider_id);
CREATE INDEX idx_provider_notifications_provider ON public.provider_notifications(provider_id, is_read);

-- ============================================
-- PART 12: FUNCTIONS & TRIGGERS
-- ============================================

-- Updated At Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Provider Matching Function
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

-- AI Booking Creation Function
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

-- Live Booking Broadcast Function
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

-- Accept Live Booking Function
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

-- Generate Booking OTP Function
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

-- Verify Booking OTP Function
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

-- Complete Booking Function
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

-- Update Provider Rating Function
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

-- Compliance Functions
CREATE OR REPLACE FUNCTION request_account_deletion(reason TEXT)
RETURNS UUID AS $$
DECLARE
    request_id UUID;
BEGIN
    INSERT INTO public.account_deletion_requests (user_id, reason)
    VALUES (auth.uid(), reason)
    RETURNING id INTO request_id;
    
    RETURN request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION report_content(
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION block_user(blocked_user_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.user_blocks (blocker_id, blocked_id)
    VALUES (auth.uid(), blocked_user_id)
    ON CONFLICT (blocker_id, blocked_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION unblock_user(blocked_user_id UUID)
RETURNS VOID AS $$
BEGIN
    DELETE FROM public.user_blocks
    WHERE blocker_id = auth.uid() AND blocked_id = blocked_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PART 13: TRIGGERS
-- ============================================

-- Updated At Triggers
CREATE TRIGGER update_service_categories_updated_at 
  BEFORE UPDATE ON public.service_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_providers_updated_at 
  BEFORE UPDATE ON public.providers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at 
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at 
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Rating Update Trigger
CREATE TRIGGER update_provider_rating_on_review_insert
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_provider_rating();

CREATE TRIGGER update_provider_rating_on_review_update
  AFTER UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_provider_rating();

CREATE TRIGGER update_provider_rating_on_review_delete
  AFTER DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_provider_rating();

-- ============================================
-- PART 14: ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_otp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "profiles_select_all" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Providers Policies
CREATE POLICY "providers_select_active" ON public.providers
  FOR SELECT USING (is_active = true);

CREATE POLICY "providers_insert_own" ON public.providers
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "providers_update_own" ON public.providers
  FOR UPDATE USING (auth.uid() = id);

-- Service Categories Policies
CREATE POLICY "service_categories_select_active" ON public.service_categories
  FOR SELECT USING (is_active = true);

-- Bookings Policies
CREATE POLICY "bookings_select_own_client" ON public.bookings
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "bookings_select_own_provider" ON public.bookings
  FOR SELECT USING (auth.uid() = provider_id);

CREATE POLICY "bookings_insert_own" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "bookings_update_own_client" ON public.bookings
  FOR UPDATE USING (
    auth.uid() = client_id 
    AND status IN ('PENDING', 'CONFIRMED')
  );

CREATE POLICY "bookings_update_own_provider" ON public.bookings
  FOR UPDATE USING (auth.uid() = provider_id);

-- Live Booking Requests Policies
CREATE POLICY "live_requests_select_own" ON public.live_booking_requests
  FOR SELECT USING (auth.uid() = provider_id);

CREATE POLICY "live_requests_insert_service" ON public.live_booking_requests
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "live_requests_update_own" ON public.live_booking_requests
  FOR UPDATE USING (
    auth.uid() = provider_id 
    AND status = 'PENDING'
  );

-- Booking OTP Policies
CREATE POLICY "booking_otp_select_client" ON public.booking_otp
  FOR SELECT USING (
    auth.uid() = (SELECT client_id FROM public.bookings WHERE id = booking_id)
  );

CREATE POLICY "booking_otp_select_provider" ON public.booking_otp
  FOR SELECT USING (
    auth.uid() = (SELECT provider_id FROM public.bookings WHERE id = booking_id)
  );

CREATE POLICY "booking_otp_insert_service" ON public.booking_otp
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "booking_otp_update_provider" ON public.booking_otp
  FOR UPDATE USING (
    auth.uid() = (SELECT provider_id FROM public.bookings WHERE id = booking_id)
  );

-- Reviews Policies
CREATE POLICY "reviews_select_all" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "reviews_insert_own" ON public.reviews
  FOR INSERT WITH CHECK (
    auth.uid() = client_id 
    AND (SELECT status FROM public.bookings WHERE id = booking_id) = 'COMPLETED'
  );

CREATE POLICY "reviews_update_own" ON public.reviews
  FOR UPDATE USING (
    auth.uid() = client_id 
    AND created_at > now() - interval '24 hours'
  );

-- Payment Methods Policies
CREATE POLICY "payment_methods_select_own" ON public.payment_methods
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "payment_methods_insert_own" ON public.payment_methods
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "payment_methods_update_own" ON public.payment_methods
  FOR UPDATE USING (auth.uid() = user_id);

-- Payment Transactions Policies
CREATE POLICY "payment_transactions_select_own" ON public.payment_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "payment_transactions_insert_own" ON public.payment_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Provider Features Policies
CREATE POLICY "provider_earnings_select_own" ON public.provider_earnings
  FOR SELECT USING (auth.uid() = provider_id);

CREATE POLICY "provider_notifications_select_own" ON public.provider_notifications
  FOR SELECT USING (auth.uid() = provider_id);

CREATE POLICY "provider_notifications_update_own" ON public.provider_notifications
  FOR UPDATE USING (auth.uid() = provider_id);

-- Offers Policies
CREATE POLICY "offers_select_active" ON public.offers
  FOR SELECT USING (is_active = true AND now() BETWEEN valid_from AND valid_until);

CREATE POLICY "user_offers_select_own" ON public.user_offers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_offers_insert_own" ON public.user_offers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Compliance Policies
CREATE POLICY "Users can create their own deletion requests"
    ON public.account_deletion_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own deletion requests"
    ON public.account_deletion_requests FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create reports"
    ON public.user_reports FOR INSERT
    WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports"
    ON public.user_reports FOR SELECT
    USING (auth.uid() = reporter_id);

CREATE POLICY "Users can block others"
    ON public.user_blocks FOR INSERT
    WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can unblock others"
    ON public.user_blocks FOR DELETE
    USING (auth.uid() = blocker_id);

CREATE POLICY "Users can view their blocks"
    ON public.user_blocks FOR SELECT
    USING (auth.uid() = blocker_id);

-- ============================================
-- PART 15: SEED DATA
-- ============================================

-- Insert Service Categories
INSERT INTO public.service_categories (name, group_name, icon, description) VALUES
  ('Plumber', 'Home Care & Repair', '🔧', 'Fix maintain and improve your home with trusted professionals.'),
  ('Electrician', 'Home Care & Repair', '⚡', 'Fix maintain and improve your home with trusted professionals.'),
  ('Carpenter', 'Home Care & Repair', '🔨', 'Fix maintain and improve your home with trusted professionals.'),
  ('Painter', 'Home Care & Repair', '🎨', 'Fix maintain and improve your home with trusted professionals.'),
  ('Appliance Repair', 'Home Care & Repair', '🔧', 'Fix maintain and improve your home with trusted professionals.'),
  ('Locksmith', 'Home Care & Repair', '🔑', 'Fix maintain and improve your home with trusted professionals.'),
  ('Pest Control', 'Home Care & Repair', '🐛', 'Fix maintain and improve your home with trusted professionals.'),
  ('Gardener', 'Home Care & Repair', '🌱', 'Fix maintain and improve your home with trusted professionals.'),
  
  ('Maid Service', 'Cleaning & Logistics', '🧹', 'Keep your space spotless and manage moves with ease.'),
  ('House Cleaning', 'Cleaning & Logistics', '🏠', 'Keep your space spotless and manage moves with ease.'),
  ('Laundry Service', 'Cleaning & Logistics', '🧺', 'Keep your space spotless and manage moves with ease.'),
  ('Packers & Movers', 'Cleaning & Logistics', '📦', 'Keep your space spotless and manage moves with ease.'),
  ('Car Washing', 'Cleaning & Logistics', '🚗', 'Keep your space spotless and manage moves with ease.'),
  
  ('Mechanic', 'Auto & Transportation', '🔧', 'Keep your vehicles running smoothly and get where you need to go.'),
  ('Driver', 'Auto & Transportation', '🚗', 'Keep your vehicles running smoothly and get where you need to go.'),
  ('Bike Repair', 'Auto & Transportation', '🚲', 'Keep your vehicles running smoothly and get where you need to go.'),
  ('Roadside Assistance', 'Auto & Transportation', '🛠️', 'Keep your vehicles running smoothly and get where you need to go.');

-- Grant Permissions
GRANT ALL ON public.service_categories TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.providers TO authenticated;
GRANT ALL ON public.bookings TO authenticated;
GRANT ALL ON public.live_booking_requests TO authenticated;
GRANT ALL ON public.booking_otp TO authenticated;
GRANT ALL ON public.reviews TO authenticated;
GRANT ALL ON public.payment_methods TO authenticated;
GRANT ALL ON public.payment_transactions TO authenticated;
GRANT ALL ON public.payment_refunds TO authenticated;
GRANT ALL ON public.provider_availability TO authenticated;
GRANT ALL ON public.provider_earnings TO authenticated;
GRANT ALL ON public.provider_notifications TO authenticated;
GRANT ALL ON public.provider_stats TO authenticated;
GRANT ALL ON public.provider_pins TO authenticated;
GRANT ALL ON public.offers TO authenticated;
GRANT ALL ON public.user_offers TO authenticated;
GRANT ALL ON public.account_deletion_requests TO authenticated;
GRANT ALL ON public.user_reports TO authenticated;
GRANT ALL ON public.user_blocks TO authenticated;

-- ============================================
-- PART 16: REALTIME SETUP
-- ============================================

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_booking_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.provider_notifications;

-- ============================================
-- PART 17: VERIFICATION QUERIES
-- ============================================

-- Run these queries to verify the setup

-- Check table count (should be ~25-30 tables)
SELECT COUNT(*) as table_count FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check function count (should be ~15-20 functions)
SELECT COUNT(*) as function_count FROM information_schema.routines 
WHERE routine_schema = 'public';

-- Check RLS enabled (should return 0 rows - all tables should have RLS)
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = false;

-- Check index count
SELECT COUNT(*) as index_count FROM pg_indexes 
WHERE schemaname = 'public';

-- Check service categories count (should be 17)
SELECT COUNT(*) as category_count FROM public.service_categories;

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- 
-- Next Steps:
-- 1. Verify all queries above return expected results
-- 2. Test user registration and profile creation
-- 3. Test booking creation flow
-- 4. Configure storage buckets in Supabase dashboard
-- 5. Set up authentication providers
-- 6. Deploy frontend applications
-- 
-- ============================================
