-- Seed Admin Users and Location Configs
-- Run this after the admin_system migration

-- Create a super admin user (replace with your actual user ID from auth.users)
-- First, you need to create a user via Supabase Auth, then insert here
-- Example:
-- INSERT INTO public.admin_users (user_id, role, permissions)
-- VALUES ('your-user-uuid-here', 'SUPER_ADMIN', '{"all": true}');

-- Seed Location Configs for Delhi NCR
INSERT INTO public.location_configs (name, is_active, service_availability, feature_flags, radius_km)
VALUES 
  (
    'Gurugram',
    true,
    '{"cleaning": true, "plumbing": true, "electrical": true, "carpentry": true, "painting": true}',
    '{"ai_booking": true, "live_tracking": true, "instant_booking": true}',
    15
  ),
  (
    'Delhi',
    true,
    '{"cleaning": true, "plumbing": true, "electrical": true, "carpentry": false, "painting": false}',
    '{"ai_booking": true, "live_tracking": false, "instant_booking": true}',
    20
  ),
  (
    'Noida',
    false,
    '{"cleaning": false, "plumbing": false, "electrical": false, "carpentry": false, "painting": false}',
    '{"ai_booking": false, "live_tracking": false, "instant_booking": false}',
    12
  ),
  (
    'Faridabad',
    false,
    '{"cleaning": false, "plumbing": false, "electrical": false, "carpentry": false, "painting": false}',
    '{"ai_booking": false, "live_tracking": false, "instant_booking": false}',
    10
  )
ON CONFLICT (name) DO NOTHING;

-- Note: To create an admin user:
-- 1. Sign up via Supabase Auth (email/password)
-- 2. Get the user UUID from auth.users table
-- 3. Run: INSERT INTO admin_users (user_id, role) VALUES ('uuid-here', 'SUPER_ADMIN');
