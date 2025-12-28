-- Seed Test Pending Provider for E2E Tests

-- 1. Insert into auth.users (if not exists)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
VALUES (
    'e2e-pending-provider-id',
    'test-pending-provider@thelokals.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"provider": "google", "providers": ["google"]}',
    '{"full_name": "Test Pending Provider"}',
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert into public.profiles (trigger might handle this, but explicit insert ensures state)
INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
VALUES (
    'e2e-pending-provider-id',
    'test-pending-provider@thelokals.com',
    'Test Pending Provider',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE
SET full_name = 'Test Pending Provider';

-- 3. Insert into public.providers
INSERT INTO public.providers (
    id,
    full_name, -- Ensure this matches profile
    category,
    description,
    experience_years,
    service_radius_km,
    is_active,
    is_verified,
    verification_status,
    created_at,
    updated_at
)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Test Pending Provider',
    'Electrician', -- Must be a valid category or just text depending on constraints
    'Test provider description for E2E',
    5,
    10,
    true,
    false, -- Not verified yet
    'pending',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE
SET verification_status = 'pending', is_verified = false;
