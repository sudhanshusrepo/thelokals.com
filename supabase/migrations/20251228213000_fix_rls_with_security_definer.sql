
-- SOLVING RLS WITH SECURITY DEFINER FUNCTION
-- This bypasses any RLS issues on the 'admin_users' table during the check

BEGIN;

-- 1. Create the helper function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER -- <--- CRITICAL: Runs as Superuser/Owner
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE id = auth.uid()
  );
END;
$$;

-- 2. Drop the old policies
DROP POLICY IF EXISTS "Admins can do everything on providers" ON public.providers;
DROP POLICY IF EXISTS "Admins can update providers" ON public.providers;

-- 3. Create the new, simplified policy
CREATE POLICY "Admins can manage providers"
ON public.providers
FOR ALL
USING ( is_admin() )
WITH CHECK ( is_admin() );

-- 4. Grant execute on the function (just in case)
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

COMMIT;
