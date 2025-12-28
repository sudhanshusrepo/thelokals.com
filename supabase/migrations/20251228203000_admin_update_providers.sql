
-- Allow admins to UPDATE providers (approve/reject)

DO $$
BEGIN
    -- Policy for UPDATE
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'providers' 
        AND policyname = 'Admins can update providers'
    ) THEN
        CREATE POLICY "Admins can update providers" 
        ON public.providers FOR UPDATE 
        USING (
            EXISTS (
                SELECT 1 FROM public.admin_users 
                WHERE id = auth.uid()
            )
        )
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.admin_users 
                WHERE id = auth.uid()
            )
        );
    END IF;
END $$;
