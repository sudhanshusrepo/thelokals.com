-- Migration: Phase 3 - Online Services MVP
-- Description: Adds support for online meeting links and provider availability schedules.

-- 1. Update bookings table for Online Services
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS meeting_link text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS meeting_provider text; -- 'jitsi', 'google_meet', 'zoom', 'custom'

-- 2. Update providers table for Availability
ALTER TABLE public.providers ADD COLUMN IF NOT EXISTS availability_schedule jsonb;
-- Schema for availability_schedule:
-- {
--   "monday": [{"start": "09:00", "end": "17:00"}],
--   "tuesday": [{"start": "09:00", "end": "17:00"}],
--   ...
--   "timezone": "Asia/Kolkata"
-- }

-- 3. Add index for availability optimization (future proofing)
CREATE INDEX IF NOT EXISTS idx_providers_availability ON public.providers USING gin(availability_schedule);
