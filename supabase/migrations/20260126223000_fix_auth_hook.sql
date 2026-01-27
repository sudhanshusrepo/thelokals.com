-- 20260126223000_fix_auth_hook.sql
-- Restores the Custom Access Token Hook required for Admin Login

BEGIN;

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_claims jsonb;
  v_email text;
  v_admin_role text;
BEGIN
  -- Extract email from the event payload
  v_email := event -> 'user' ->> 'email';
  v_claims := event -> 'claims';

  -- Check if this email belongs to an admin
  SELECT role INTO v_admin_role
  FROM public.admins
  WHERE email = v_email;

  -- If found in admins table, inject the role
  IF v_admin_role IS NOT NULL THEN
    v_claims := jsonb_set(v_claims, '{user_role}', to_jsonb(v_admin_role)); 
    v_claims := jsonb_set(v_claims, '{role}', to_jsonb('admin')); -- Postgres role
    v_claims := jsonb_set(v_claims, '{app_role}', to_jsonb(v_admin_role));
  END IF;

  RETURN v_claims;
END;
$$;

GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT SELECT ON public.admins TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;

COMMIT;
