
-- Enable RLS (idempotent)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own admin profile
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'admin_users' 
        AND policyname = 'Allow users to read own admin profile'
    ) THEN
        CREATE POLICY "Allow users to read own admin profile" 
        ON public.admin_users FOR SELECT 
        USING (auth.uid() = id);
    END IF;
END $$;
