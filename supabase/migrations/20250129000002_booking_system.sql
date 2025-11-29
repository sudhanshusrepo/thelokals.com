-- Migration: Booking System
-- Description: Create bookings, live booking requests, and OTP tables
-- Phase: 2 of 6

-- Booking Status Enum
DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM (
    'PENDING',
    'CONFIRMED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Booking Type Enum
DO $$ BEGIN
  CREATE TYPE booking_type AS ENUM (
    'AI_ENHANCED',
    'LIVE',
    'SCHEDULED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Payment Status Enum
DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM (
    'PENDING',
    'PAID',
    'REFUNDED',
    'FAILED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Bookings Table
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
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Live Booking Request Status Enum
DO $$ BEGIN
  CREATE TYPE request_status AS ENUM (
    'PENDING',
    'ACCEPTED',
    'REJECTED',
    'EXPIRED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Live Booking Requests Table
CREATE TABLE IF NOT EXISTS public.live_booking_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id uuid REFERENCES public.bookings NOT NULL,
  provider_id uuid REFERENCES public.providers NOT NULL,
  status request_status DEFAULT 'PENDING',
  expires_at timestamptz NOT NULL,
  responded_at timestamptz,
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(booking_id, provider_id)
);

-- Booking OTP Table
CREATE TABLE IF NOT EXISTS public.booking_otp (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id uuid REFERENCES public.bookings NOT NULL,
  otp_code text NOT NULL,
  is_verified boolean DEFAULT false,
  expires_at timestamptz NOT NULL,
  verified_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_otp ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX idx_bookings_client ON public.bookings(client_id, created_at DESC);
CREATE INDEX idx_bookings_provider ON public.bookings(provider_id, status, created_at DESC);
CREATE INDEX idx_bookings_status ON public.bookings(status, created_at DESC);
CREATE INDEX idx_bookings_date ON public.bookings(scheduled_date);
CREATE INDEX idx_bookings_location ON public.bookings USING GIST (location);

CREATE INDEX idx_live_requests_provider ON public.live_booking_requests(provider_id, status, created_at DESC);
CREATE INDEX idx_live_requests_booking ON public.live_booking_requests(booking_id);
CREATE INDEX idx_live_requests_expires ON public.live_booking_requests(expires_at) WHERE status = 'PENDING';

CREATE INDEX idx_booking_otp_booking ON public.booking_otp(booking_id);
CREATE INDEX idx_booking_otp_code ON public.booking_otp(otp_code) WHERE is_verified = false;

-- Add updated_at trigger
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-expire old live booking requests
CREATE OR REPLACE FUNCTION expire_old_live_requests()
RETURNS void AS $$
BEGIN
  UPDATE public.live_booking_requests
  SET status = 'EXPIRED'
  WHERE status = 'PENDING' AND expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to run expiry (requires pg_cron extension)
-- Note: This will need to be set up separately in Supabase dashboard
-- SELECT cron.schedule('expire-live-requests', '*/1 * * * *', 'SELECT expire_old_live_requests()');
