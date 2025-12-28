
-- AUDIT TRIGGERS HELPER
-- Use this to inspect triggers since information_schema is restricted

BEGIN;

CREATE OR REPLACE FUNCTION public.get_triggers_for_table(p_table_name text)
RETURNS TABLE (
    trigger_name name,
    event_manipulation text,
    action_statement text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        trigger_name::name,
        event_manipulation::text,
        action_statement::text
    FROM information_schema.triggers
    WHERE event_object_table = p_table_name
    AND trigger_schema = 'public';
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_triggers_for_table(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_triggers_for_table(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_triggers_for_table(text) TO service_role;

NOTIFY pgrst, 'reload_schema';

COMMIT;
