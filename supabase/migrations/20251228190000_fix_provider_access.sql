
-- Allow admins to view all providers
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'providers' 
        AND policyname = 'Admins can view all providers'
    ) THEN
        CREATE POLICY "Admins can view all providers" 
        ON public.providers FOR SELECT 
        USING (
            EXISTS (
                SELECT 1 FROM public.admin_users 
                WHERE id = auth.uid()
            )
        );
    END IF;
END $$;
