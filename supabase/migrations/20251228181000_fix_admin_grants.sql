
-- Grant access to admin_users
GRANT SELECT ON public.admin_users TO authenticated;
GRANT SELECT ON public.admin_users TO service_role; -- Implicit usually
