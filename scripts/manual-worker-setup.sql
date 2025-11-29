-- MANUAL WORKER SETUP SCRIPT
-- Run this in Supabase SQL Editor AFTER creating users in the Authentication Dashboard

-- Instructions:
-- 1. Go to Authentication -> Users -> Add User
-- 2. Create users with the following emails (password can be anything, e.g., "Worker@123"):
--    - rajesh.plumber@thelokals.com
--    - amit.electrician@thelokals.com
--    - suresh.carpenter@thelokals.com
--    - priya.maid@thelokals.com
--    - vikram.mechanic@thelokals.com
-- 3. Run this entire script in the SQL Editor

-- Worker 1: Rajesh Kumar (Plumber)
DO $$
DECLARE
  v_user_id uuid;
  v_email text := 'rajesh.plumber@thelokals.com';
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
  
  IF v_user_id IS NOT NULL THEN
    -- Update User Metadata
    UPDATE auth.users 
    SET raw_user_meta_data = '{"full_name": "Rajesh Kumar", "role": "provider"}'::jsonb
    WHERE id = v_user_id;

    -- Insert Profile
    INSERT INTO public.profiles (id, full_name, phone, email, created_at, updated_at)
    VALUES (v_user_id, 'Rajesh Kumar', '+919876543210', v_email, now(), now())
    ON CONFLICT (id) DO NOTHING;

    -- Insert Provider
    INSERT INTO public.providers (
      id, full_name, phone, email, category, experience_years, 
      operating_location, service_radius_km, is_verified, is_active, 
      rating_average, total_jobs, total_earnings, bio, created_at, updated_at
    ) VALUES (
      v_user_id, 'Rajesh Kumar', '+919876543210', v_email, 'Plumber', 8,
      ST_SetSRID(ST_MakePoint(-122.4194, 37.7749), 4326)::geography,
      15, true, true, 4.5, 156, 125000,
      'Experienced plumber with 8+ years in residential and commercial plumbing. Expert in leak repairs, installations, and emergency services.',
      now(), now()
    )
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE '✅ Successfully set up %', v_email;
  ELSE
    RAISE NOTICE '⚠️ User % not found. Please create in Auth Dashboard first.', v_email;
  END IF;
END $$;

-- Worker 2: Amit Sharma (Electrician)
DO $$
DECLARE
  v_user_id uuid;
  v_email text := 'amit.electrician@thelokals.com';
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
  
  IF v_user_id IS NOT NULL THEN
    UPDATE auth.users SET raw_user_meta_data = '{"full_name": "Amit Sharma", "role": "provider"}'::jsonb WHERE id = v_user_id;

    INSERT INTO public.profiles (id, full_name, phone, email, created_at, updated_at)
    VALUES (v_user_id, 'Amit Sharma', '+919876543211', v_email, now(), now())
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.providers (
      id, full_name, phone, email, category, experience_years, 
      operating_location, service_radius_km, is_verified, is_active, 
      rating_average, total_jobs, total_earnings, bio, created_at, updated_at
    ) VALUES (
      v_user_id, 'Amit Sharma', '+919876543211', v_email, 'Electrician', 6,
      ST_SetSRID(ST_MakePoint(-122.4194, 37.7799), 4326)::geography,
      12, true, true, 4.7, 203, 180000,
      'Certified electrician specializing in home wiring, appliance installation, and electrical repairs. Available for emergency calls.',
      now(), now()
    )
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE '✅ Successfully set up %', v_email;
  ELSE
    RAISE NOTICE '⚠️ User % not found. Please create in Auth Dashboard first.', v_email;
  END IF;
END $$;

-- Worker 3: Suresh Patel (Carpenter)
DO $$
DECLARE
  v_user_id uuid;
  v_email text := 'suresh.carpenter@thelokals.com';
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
  
  IF v_user_id IS NOT NULL THEN
    UPDATE auth.users SET raw_user_meta_data = '{"full_name": "Suresh Patel", "role": "provider"}'::jsonb WHERE id = v_user_id;

    INSERT INTO public.profiles (id, full_name, phone, email, created_at, updated_at)
    VALUES (v_user_id, 'Suresh Patel', '+919876543212', v_email, now(), now())
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.providers (
      id, full_name, phone, email, category, experience_years, 
      operating_location, service_radius_km, is_verified, is_active, 
      rating_average, total_jobs, total_earnings, bio, created_at, updated_at
    ) VALUES (
      v_user_id, 'Suresh Patel', '+919876543212', v_email, 'Carpenter', 10,
      ST_SetSRID(ST_MakePoint(-122.4144, 37.7749), 4326)::geography,
      10, true, true, 4.8, 289, 250000,
      'Master carpenter with expertise in custom furniture, door/window installation, and furniture repair. Quality workmanship guaranteed.',
      now(), now()
    )
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE '✅ Successfully set up %', v_email;
  ELSE
    RAISE NOTICE '⚠️ User % not found. Please create in Auth Dashboard first.', v_email;
  END IF;
END $$;

-- Worker 4: Priya Singh (Maid Service)
DO $$
DECLARE
  v_user_id uuid;
  v_email text := 'priya.maid@thelokals.com';
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
  
  IF v_user_id IS NOT NULL THEN
    UPDATE auth.users SET raw_user_meta_data = '{"full_name": "Priya Singh", "role": "provider"}'::jsonb WHERE id = v_user_id;

    INSERT INTO public.profiles (id, full_name, phone, email, created_at, updated_at)
    VALUES (v_user_id, 'Priya Singh', '+919876543213', v_email, now(), now())
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.providers (
      id, full_name, phone, email, category, experience_years, 
      operating_location, service_radius_km, is_verified, is_active, 
      rating_average, total_jobs, total_earnings, bio, created_at, updated_at
    ) VALUES (
      v_user_id, 'Priya Singh', '+919876543213', v_email, 'Maid Service', 5,
      ST_SetSRID(ST_MakePoint(-122.4194, 37.7699), 4326)::geography,
      8, true, true, 4.6, 412, 195000,
      'Professional house cleaning service with 5 years experience. Reliable, trustworthy, and detail-oriented. Available for daily or part-time work.',
      now(), now()
    )
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE '✅ Successfully set up %', v_email;
  ELSE
    RAISE NOTICE '⚠️ User % not found. Please create in Auth Dashboard first.', v_email;
  END IF;
END $$;

-- Worker 5: Vikram Reddy (Mechanic)
DO $$
DECLARE
  v_user_id uuid;
  v_email text := 'vikram.mechanic@thelokals.com';
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
  
  IF v_user_id IS NOT NULL THEN
    UPDATE auth.users SET raw_user_meta_data = '{"full_name": "Vikram Reddy", "role": "provider"}'::jsonb WHERE id = v_user_id;

    INSERT INTO public.profiles (id, full_name, phone, email, created_at, updated_at)
    VALUES (v_user_id, 'Vikram Reddy', '+919876543214', v_email, now(), now())
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.providers (
      id, full_name, phone, email, category, experience_years, 
      operating_location, service_radius_km, is_verified, is_active, 
      rating_average, total_jobs, total_earnings, bio, created_at, updated_at
    ) VALUES (
      v_user_id, 'Vikram Reddy', '+919876543214', v_email, 'Mechanic', 12,
      ST_SetSRID(ST_MakePoint(-122.4244, 37.7749), 4326)::geography,
      20, true, true, 4.9, 567, 450000,
      'Expert auto mechanic with 12+ years experience. Specializing in all car brands, general service, repairs, and diagnostics. Mobile service available.',
      now(), now()
    )
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE '✅ Successfully set up %', v_email;
  ELSE
    RAISE NOTICE '⚠️ User % not found. Please create in Auth Dashboard first.', v_email;
  END IF;
END $$;
