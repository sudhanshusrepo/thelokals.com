-- Migration: RLS Policies
-- Description: Comprehensive Row Level Security policies
-- Phase: 4 of 6

-- Drop old insecure policies if they exist
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Worker profiles are viewable by everyone." ON public.workers;
DROP POLICY IF EXISTS "Reviews are public and viewable by everyone." ON public.reviews;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Anyone can view profiles (needed for provider discovery)
CREATE POLICY "profiles_select_all" ON public.profiles
  FOR SELECT USING (true);

-- Users can insert their own profile
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- PROVIDERS POLICIES
-- ============================================

-- Anyone can view active, verified providers
CREATE POLICY "providers_select_active" ON public.providers
  FOR SELECT USING (is_active = true);

-- Providers can insert their own profile
CREATE POLICY "providers_insert_own" ON public.providers
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Providers can update their own profile
CREATE POLICY "providers_update_own" ON public.providers
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- SERVICE CATEGORIES POLICIES
-- ============================================

-- Anyone can view active service categories
CREATE POLICY "service_categories_select_active" ON public.service_categories
  FOR SELECT USING (is_active = true);

-- ============================================
-- BOOKINGS POLICIES
-- ============================================

-- Clients can view their own bookings
CREATE POLICY "bookings_select_own_client" ON public.bookings
  FOR SELECT USING (auth.uid() = client_id);

-- Providers can view bookings assigned to them
CREATE POLICY "bookings_select_own_provider" ON public.bookings
  FOR SELECT USING (auth.uid() = provider_id);

-- Clients can create their own bookings
CREATE POLICY "bookings_insert_own" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Clients can update their own pending bookings
CREATE POLICY "bookings_update_own_client" ON public.bookings
  FOR UPDATE USING (
    auth.uid() = client_id 
    AND status IN ('PENDING', 'CONFIRMED')
  );

-- Providers can update bookings assigned to them
CREATE POLICY "bookings_update_own_provider" ON public.bookings
  FOR UPDATE USING (auth.uid() = provider_id);

-- ============================================
-- LIVE BOOKING REQUESTS POLICIES
-- ============================================

-- Providers can view requests sent to them
CREATE POLICY "live_requests_select_own" ON public.live_booking_requests
  FOR SELECT USING (auth.uid() = provider_id);

-- System can create requests (service role only)
CREATE POLICY "live_requests_insert_service" ON public.live_booking_requests
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Providers can update their own request responses
CREATE POLICY "live_requests_update_own" ON public.live_booking_requests
  FOR UPDATE USING (
    auth.uid() = provider_id 
    AND status = 'PENDING'
  );

-- ============================================
-- BOOKING OTP POLICIES
-- ============================================

-- Clients can view OTP for their bookings
CREATE POLICY "booking_otp_select_client" ON public.booking_otp
  FOR SELECT USING (
    auth.uid() = (SELECT client_id FROM public.bookings WHERE id = booking_id)
  );

-- Providers can view OTP for their bookings
CREATE POLICY "booking_otp_select_provider" ON public.booking_otp
  FOR SELECT USING (
    auth.uid() = (SELECT provider_id FROM public.bookings WHERE id = booking_id)
  );

-- System can create OTP (service role only)
CREATE POLICY "booking_otp_insert_service" ON public.booking_otp
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Providers can verify OTP
CREATE POLICY "booking_otp_update_provider" ON public.booking_otp
  FOR UPDATE USING (
    auth.uid() = (SELECT provider_id FROM public.bookings WHERE id = booking_id)
  );

-- ============================================
-- REVIEWS POLICIES
-- ============================================

-- Anyone can read reviews
CREATE POLICY "reviews_select_all" ON public.reviews
  FOR SELECT USING (true);

-- Clients can create reviews for their completed bookings
CREATE POLICY "reviews_insert_own" ON public.reviews
  FOR INSERT WITH CHECK (
    auth.uid() = client_id 
    AND (SELECT status FROM public.bookings WHERE id = booking_id) = 'COMPLETED'
    AND NOT EXISTS (SELECT 1 FROM public.reviews WHERE booking_id = NEW.booking_id)
  );

-- Clients can update their own reviews (within 24 hours)
CREATE POLICY "reviews_update_own" ON public.reviews
  FOR UPDATE USING (
    auth.uid() = client_id 
    AND created_at > now() - interval '24 hours'
  );
