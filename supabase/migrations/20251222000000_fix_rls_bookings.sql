-- Fix RLS Policies for Bookings
-- Ensure authenticated users can insert their own bookings
-- Ensure authenticated users can view their own bookings immediately after insert

BEGIN;

-- Drop existing policies to avoid conflicts or stale logic
DROP POLICY IF EXISTS "bookings_insert_own" ON public.bookings;
DROP POLICY IF EXISTS "bookings_select_own_client" ON public.bookings;

-- Re-create Insert Policy
CREATE POLICY "bookings_insert_own" ON public.bookings
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Re-create Select Policy (Needed for INSERT ... RETURNING)
CREATE POLICY "bookings_select_own_client" ON public.bookings
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Ensure Permissions are granted
GRANT ALL ON public.bookings TO authenticated;

COMMIT;
