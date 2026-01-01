-- ============================================
-- SPRINT 1: ADMIN & SERVICE CONFIGURATION
-- ============================================

-- 1. Create Locations Table (Missing from consolidated schema)
CREATE TABLE IF NOT EXISTS public.locations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    hierarchy_level text NOT NULL CHECK (hierarchy_level IN ('L1_COUNTRY', 'L2_REGION', 'L3_CITY', 'L4_ZONE', 'L5_PINCODE')),
    name text NOT NULL,
    parent_id uuid REFERENCES public.locations(id) ON DELETE CASCADE,
    center_lat numeric,
    center_lng numeric,
    polygon geography(Polygon, 4326),
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(hierarchy_level, name, parent_id)
);

-- Enable RLS for locations
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'locations' 
        AND policyname = 'Public read access'
    ) THEN
        CREATE POLICY "Public read access" ON public.locations FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'locations' 
        AND policyname = 'Admin write access'
    ) THEN
        CREATE POLICY "Admin write access" ON public.locations FOR ALL USING (
            EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
        );
    END IF;
END $$;


-- 2. Create Service Availability Table
CREATE TABLE IF NOT EXISTS public.service_availability (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    service_category_id uuid REFERENCES public.service_categories(id) ON DELETE CASCADE,
    location_type text NOT NULL CHECK (location_type IN ('city', 'zone', 'pincode')),
    location_value text NOT NULL, -- The city name or ID
    status text NOT NULL CHECK (status IN ('ENABLED', 'DISABLED')),
    reason text,
    disabled_by uuid REFERENCES public.admin_users(id),
    disabled_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(service_category_id, location_type, location_value)
);

-- Enable RLS for service_availability
ALTER TABLE public.service_availability ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'service_availability' 
        AND policyname = 'Public read access'
    ) THEN
        CREATE POLICY "Public read access" ON public.service_availability FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'service_availability' 
        AND policyname = 'Admin write access'
    ) THEN
        CREATE POLICY "Admin write access" ON public.service_availability FOR ALL USING (
            EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
        );
    END IF;
END $$;


-- 3. Seed Location: Gurugram
DO $$
DECLARE
    v_india_id uuid;
    v_haryana_id uuid;
    v_gurugram_id uuid;
BEGIN
    -- L1: India
    INSERT INTO public.locations (hierarchy_level, name, center_lat, center_lng)
    VALUES ('L1_COUNTRY', 'India', 20.5937, 78.9629)
    ON CONFLICT (hierarchy_level, name, parent_id) DO UPDATE SET updated_at = now()
    RETURNING id INTO v_india_id;

    -- L2: Haryana
    INSERT INTO public.locations (hierarchy_level, name, parent_id, center_lat, center_lng)
    VALUES ('L2_REGION', 'Haryana', v_india_id, 29.0588, 76.0856)
    ON CONFLICT (hierarchy_level, name, parent_id) DO UPDATE SET updated_at = now()
    RETURNING id INTO v_haryana_id;

    -- L3: Gurugram
    INSERT INTO public.locations (hierarchy_level, name, parent_id, center_lat, center_lng)
    VALUES ('L3_CITY', 'Gurugram', v_haryana_id, 28.4595, 77.0266)
    ON CONFLICT (hierarchy_level, name, parent_id) DO UPDATE SET updated_at = now()
    RETURNING id INTO v_gurugram_id;

    -- L4: Sector 45 (Example Zone)
    INSERT INTO public.locations (hierarchy_level, name, parent_id, center_lat, center_lng)
    VALUES ('L4_ZONE', 'Sector 45', v_gurugram_id, 28.4485, 77.0620)
    ON CONFLICT (hierarchy_level, name, parent_id) DO UPDATE SET updated_at = now();
END $$;


-- 4. Seed Super Admin User (Assuming user exists in auth.users or will be created)
-- Note: In Supabase, you create the auth user separately. This just grants the role.
-- We will insert a placeholder that matches the email if it exists, or handle it via a function.
-- For E2E tests, we usually create the user via API then insert here.
-- Here we'll ensure the table exists and maybe creating a trigger to auto-promote specific emails?
-- For now, let's just make sure the table supports it. The actual INSERT depends on auth.uid() which we don't have yet.
-- But the requirement is to Configure Admin Auth.

-- Let's create a function to promote a user to admin by email (easier for manual setup)
CREATE OR REPLACE FUNCTION public.promote_to_admin(p_email text)
RETURNS void AS $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
  
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.admin_users (id, role, is_active)
    VALUES (v_user_id, 'SUPER_ADMIN', true)
    ON CONFLICT (id) DO UPDATE SET role = 'SUPER_ADMIN', is_active = true;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 5. Seed Services (ensure all categories exist)
-- (Already handled by seed_service_categories.sql, but let's ensure 'AC Service', 'Bike Rental' are there)
INSERT INTO public.service_categories (name, group_name, icon, description, is_active)
VALUES 
    ('AC Service', 'Home Care & Repair', '❄️', 'AC repair and servicing', true),
    ('Bike Rental', 'Transport', '🏍️', 'Rent a bike for daily use', true),
    ('Car Rental', 'Transport', '🚗', 'Rent a car for daily use', true)
ON CONFLICT (name) DO NOTHING;

