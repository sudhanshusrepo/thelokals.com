-- Enable RLS policies for profiles table to fix Admin Access

-- 1. Ensure RLS is enabled (it was, but good practice)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Policy: Users can view their own profile
-- This allows getAdminByEmail to work for the logged-in user
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- 3. Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4. Policy: Admins can view all profiles
-- Prevents recursion by not querying profiles recursively if possible, but admin_users is separate.
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

-- 5. Policy: Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

-- 6. Grant permissions (just in case)
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
