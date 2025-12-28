
-- FORCE REFRESH DDL
-- Updating a table definition forces PostgREST to reload its schema cache.

COMMENT ON TABLE public.providers IS 'Providers Table (Refreshed)';

NOTIFY pgrst, 'reload_schema';
