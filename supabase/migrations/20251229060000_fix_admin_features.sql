
-- MASTER FIX FOR ADMIN FEATURES
-- 1. Clears all Triggers on providers (to remove silent blockers)
-- 2. Clears all Policies on providers/service_categories/admin_users (to remove conflicts)
-- 3. Re-applies clean, standard RLS policies
-- 4. Grants necessary permissions

BEGIN;

-- ==========================================
-- 1. NUKE TRIGGERS
-- ==========================================
DO $$
DECLARE
    t RECORD;
BEGIN
    FOR t IN 
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_table = 'providers'
        AND trigger_schema = 'public'
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS "' || t.trigger_name || '" ON public.providers';
    END LOOP;
END $$;


-- ==========================================
-- 2. SCRUB POLICIES
-- ==========================================
DO $$ 
DECLARE 
    r RECORD; 
BEGIN 
    -- Providers
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'providers' 
    LOOP 
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.providers'; 
    END LOOP; 
    
    -- Service Categories
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'service_categories' 
    LOOP 
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.service_categories'; 
    END LOOP;

    -- Admin Users
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'admin_users' 
    LOOP 
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.admin_users'; 
    END LOOP;
END $$;


-- ==========================================
-- 3. APPLY CLEAN POLICIES
-- ==========================================

-- A. ADMIN USERS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view admin_users"
ON public.admin_users FOR SELECT
TO authenticated
USING (true);

-- B. PROVIDERS
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view providers"
ON public.providers FOR SELECT
USING (true);

CREATE POLICY "Admins can manage providers"
ON public.providers FOR ALL
USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
)
WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

CREATE POLICY "Providers can manage own profile"
ON public.providers FOR ALL
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- C. SERVICE CATEGORIES
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read service_categories"
ON public.service_categories FOR SELECT
USING (true);

CREATE POLICY "Admins can manage service categories"
ON public.service_categories FOR ALL
USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
)
WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);


-- ==========================================
-- 4. GRANTS
-- ==========================================
GRANT ALL ON public.providers TO authenticated;
GRANT ALL ON public.service_categories TO authenticated;
GRANT SELECT ON public.admin_users TO authenticated;
GRANT SELECT ON public.providers TO anon;
GRANT SELECT ON public.service_categories TO anon;


-- ==========================================
-- 5. REFRESH CACHE
-- ==========================================
NOTIFY pgrst, 'reload_schema';

COMMIT;
