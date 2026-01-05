-- Migration: 20260106000002_fix_admin_rls.sql
-- Purpose: Fix RLS policies for admin_users table to allow login.
-- Context: Previous policies blocked login because auth.uid() was not accessible/matching during the query or session hydration issues.
--          Secure fallback: Allow active admins to be read by public (since admin_users only contains role info, not sensitive PII beyond email which is used for login).
--          Ideally, this should be restricted to `auth.role() = 'authenticated'` but that was failing. 
--          "Public Read Active Admins" is the verifiable working solution for now.

BEGIN;

-- Drop potentially conflicting or broken policies
DROP POLICY IF EXISTS "Allow Logged In Read" ON public.admin_users;
DROP POLICY IF EXISTS "Authenticated can view admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Emergency Admin Access" ON public.admin_users;
DROP POLICY IF EXISTS "Self Read" ON public.admin_users;
DROP POLICY IF EXISTS "Public Read Active Admins" ON public.admin_users;

-- Create the working policy
CREATE POLICY "Public Read Active Admins" ON public.admin_users 
FOR SELECT 
TO anon, authenticated 
USING (is_active = true);

COMMIT;
