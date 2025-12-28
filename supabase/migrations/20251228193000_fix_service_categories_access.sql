
-- Allow admins to manage service categories
DO $$
BEGIN
    -- Policy for SELECT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'service_categories' 
        AND policyname = 'Admins can view service categories'
    ) THEN
        CREATE POLICY "Admins can view service categories" 
        ON public.service_categories FOR SELECT 
        USING (true); -- Public read is fine, or restrict to auth/admin
    END IF;

    -- Policy for ALL (Insert, Update, Delete)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'service_categories' 
        AND policyname = 'Admins can manage service categories'
    ) THEN
        CREATE POLICY "Admins can manage service categories" 
        ON public.service_categories FOR ALL 
        USING (
            EXISTS (
                SELECT 1 FROM public.admin_users 
                WHERE id = auth.uid()
            )
        );
    END IF;
END $$;

-- Also ensure RLS is enabled
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

-- Grant permissions if missing
GRANT ALL ON public.service_categories TO authenticated;
