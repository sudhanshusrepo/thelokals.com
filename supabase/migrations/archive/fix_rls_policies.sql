-- Fix RLS Policies for profiles table
-- Run this in Supabase SQL Editor to resolve 406/400 errors

-- 1. Ensure anon role has access
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT ON public.service_categories TO anon;
GRANT SELECT ON public.providers TO anon;

-- 2. Re-create profiles policies to ensure they work correctly
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
CREATE POLICY "profiles_select_all" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 3. Ensure authenticated users can do everything
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.service_categories TO authenticated;
GRANT ALL ON public.providers TO authenticated;

-- 4. Verify RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
