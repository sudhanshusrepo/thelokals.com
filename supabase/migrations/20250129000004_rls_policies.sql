-- Migration: RLS Policies
-- Description: Comprehensive Row Level Security policies
-- Phase: 4 of 6
-- Idempotent: Safe to re-run

-- Drop all existing policies
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

DROP POLICY IF EXISTS "providers_select_active" ON public.providers;
DROP POLICY IF EXISTS "providers_insert_own" ON public.providers;
DROP POLICY IF EXISTS "providers_update_own" ON public.providers;

DROP POLICY IF EXISTS "service_categories_select_active" ON public.service_categories;

DROP POLICY IF EXISTS "bookings_select_own_client" ON public.bookings;
DROP POLICY IF EXISTS "bookings_select_own_provider" ON public.bookings;
DROP POLICY IF EXISTS "bookings_insert_own" ON public.bookings;
DROP POLICY IF EXISTS "bookings_update_own_client" ON public.bookings;
DROP POLICY IF EXISTS "bookings_update_own_provider" ON public.bookings;

DROP POLICY IF EXISTS "live_requests_select_own" ON public.live_booking_requests;
DROP POLICY IF EXISTS "live_requests_insert_service" ON public.live_booking_requests;
DROP POLICY IF EXISTS "live_requests_update_own" ON public.live_booking_requests;

DROP POLICY IF EXISTS "booking_otp_select_client" ON public.booking_otp;
DROP POLICY IF EXISTS "booking_otp_select_provider" ON public.booking_otp;
DROP POLICY IF EXISTS "booking_otp_insert_service" ON public.booking_otp;
DROP POLICY IF EXISTS "booking_otp_update_provider" ON public.booking_otp;

DROP POLICY IF EXISTS "reviews_select_all" ON public.reviews;
DROP POLICY IF EXISTS "reviews_insert_own" ON public.reviews;
DROP POLICY IF EXISTS "reviews_update_own" ON public.reviews;

-- ============================================
-- PROFILES POLICIES
-- ============================================

CREATE POLICY "profiles_select_all" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- PROVIDERS POLICIES
-- ============================================

CREATE POLICY "providers_select_active" ON public.providers
  FOR SELECT USING (is_active = true);

CREATE POLICY "providers_insert_own" ON public.providers
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "providers_update_own" ON public.providers
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- SERVICE CATEGORIES POLICIES
-- ============================================

CREATE POLICY "service_categories_select_active" ON public.service_categories
  FOR SELECT USING (is_active = true);

-- ============================================
-- BOOKINGS POLICIES
-- ============================================

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

-- ============================================
-- LIVE BOOKING REQUESTS POLICIES
-- ============================================

CREATE POLICY "live_requests_select_own" ON public.live_booking_requests
  FOR SELECT USING (auth.uid() = provider_id);

CREATE POLICY "live_requests_insert_service" ON public.live_booking_requests
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "live_requests_update_own" ON public.live_booking_requests
  FOR UPDATE USING (
    auth.uid() = provider_id 
    AND status = 'PENDING'
  );

-- ============================================
-- BOOKING OTP POLICIES
-- ============================================

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

-- ============================================
-- REVIEWS POLICIES
-- ============================================

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
