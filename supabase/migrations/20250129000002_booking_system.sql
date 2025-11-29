-- Migration: Booking System
-- Description: Create bookings, live booking requests, and OTP tables
-- Phase: 2 of 6
-- Idempotent: Safe to re-run

-- Drop existing types if they exist
DROP TYPE IF EXISTS booking_status CASCADE;
DROP TYPE IF EXISTS booking_type CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS request_status CASCADE;

-- Drop existing tables
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.live_booking_requests CASCADE;
DROP TABLE IF EXISTS public.booking_otp CASCADE;

-- Drop existing indexes
DROP INDEX IF EXISTS idx_bookings_client;
DROP INDEX IF EXISTS idx_bookings_provider;
DROP INDEX IF EXISTS idx_bookings_status;
DROP INDEX IF EXISTS idx_bookings_date;
DROP INDEX IF EXISTS idx_bookings_location;
DROP INDEX IF EXISTS idx_live_requests_provider;
DROP INDEX IF EXISTS idx_live_requests_booking;
DROP INDEX IF EXISTS idx_live_requests_expires;
DROP INDEX IF EXISTS idx_booking_otp_booking;
DROP INDEX IF EXISTS idx_booking_otp_code;

-- Create enums
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
  booking_id uuid REFERENCES public.bookings NOT NULL,
  provider_id uuid REFERENCES public.providers NOT NULL,
  status request_status DEFAULT 'PENDING',
  expires_at timestamptz NOT NULL,
  responded_at timestamptz,
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(booking_id, provider_id)
);

-- Booking OTP Table
CREATE TABLE public.booking_otp (
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

-- Create indexes
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
CREATE TRIGGER update_bookings_updated_at 
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-expire old live booking requests function
CREATE OR REPLACE FUNCTION expire_old_live_requests()
RETURNS void AS $$
BEGIN
  UPDATE public.live_booking_requests
  SET status = 'EXPIRED'
  WHERE status = 'PENDING' AND expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
