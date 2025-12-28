
-- RE-APPLY Service Categories Policies FORCEFULLY

BEGIN;

-- Drop potential conflicting policies
DROP POLICY IF EXISTS "Admins can view service categories" ON public.service_categories;
DROP POLICY IF EXISTS "Admins can manage service categories" ON public.service_categories;
DROP POLICY IF EXISTS "Public read access" ON public.service_categories;

-- Enable RLS
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

-- 1. VIEW Policy (Allow Public Read for now to ensure frontend can at least see them)
CREATE POLICY "Public read service categories" 
ON public.service_categories FOR SELECT 
USING (true);

-- 2. MANAGE Policy (Admins)
CREATE POLICY "Admins can manage service categories" 
ON public.service_categories FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE id = auth.uid()
    )
);

-- Grant permissions
GRANT ALL ON public.service_categories TO authenticated;
GRANT SELECT ON public.service_categories TO anon;

COMMIT;
