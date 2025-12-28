-- 1. Remove existing admin user (by email) to clean slate
-- Note: Must delete from dependents first due to FK constraints
DELETE FROM public.admin_users WHERE id IN (SELECT id FROM public.profiles WHERE email = 'admin@thelokals.com');
DELETE FROM public.profiles WHERE email = 'admin@thelokals.com';
DELETE FROM auth.users WHERE email = 'admin@thelokals.com';

-- 2. Insert into auth.users with fixed UUID
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'admin@thelokals.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"provider": "google", "providers": ["google"]}',
    '{"full_name": "Admin User"}',
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
)
ON CONFLICT (id) DO UPDATE
SET email = 'admin@thelokals.com', encrypted_password = crypt('password123', gen_salt('bf'));

-- 3. Insert into public.profiles
INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'admin@thelokals.com',
    'Admin User',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET full_name = 'Admin User';

-- 4. Insert into public.admin_users
INSERT INTO public.admin_users (id, role, is_active, created_at, updated_at)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'SUPER_ADMIN',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET is_active = true;
