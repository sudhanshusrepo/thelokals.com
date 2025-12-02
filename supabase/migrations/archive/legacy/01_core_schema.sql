-- 01_core_schema.sql
-- Core Schema: Extensions, Enums, Profiles, Providers, Service Categories

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Enums
DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_type AS ENUM ('AI_ENHANCED', 'LIVE', 'SCHEDULED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'REFUNDED', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE request_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method_type AS ENUM ('CARD', 'UPI', 'NETBANKING', 'WALLET', 'CASH');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE refund_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PROCESSED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE admin_role AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'SUPPORT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Utility Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Core Tables

-- Service Categories
CREATE TABLE IF NOT EXISTS public.service_categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  group_name text NOT NULL,
  icon text,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Profiles (Customer profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
  full_name text,
  phone text,
  email text,
  avatar_url text,
  address jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Providers (Service providers)
CREATE TABLE IF NOT EXISTS public.providers (
  id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
  full_name text NOT NULL,
  phone text,
  email text,
  category text NOT NULL,
  experience_years integer DEFAULT 0,
  operating_location geography(Point, 4326),
  service_radius_km numeric DEFAULT 10,
  is_verified boolean DEFAULT false,
  is_active boolean DEFAULT true,
  rating_average numeric(3, 2) DEFAULT 0.0,
  total_jobs integer DEFAULT 0,
  total_earnings numeric(10, 2) DEFAULT 0,
  profile_image_url text,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_service_categories_group ON public.service_categories(group_name);
CREATE INDEX IF NOT EXISTS idx_service_categories_active ON public.service_categories(is_active);

CREATE INDEX IF NOT EXISTS idx_providers_location ON public.providers USING GIST (operating_location);
CREATE INDEX IF NOT EXISTS idx_providers_category ON public.providers(category);
CREATE INDEX IF NOT EXISTS idx_providers_active ON public.providers(is_active, is_verified);
CREATE INDEX IF NOT EXISTS idx_providers_rating ON public.providers(rating_average DESC);

-- 6. Triggers
DROP TRIGGER IF EXISTS update_service_categories_updated_at ON public.service_categories;
CREATE TRIGGER update_service_categories_updated_at 
  BEFORE UPDATE ON public.service_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_providers_updated_at ON public.providers;
CREATE TRIGGER update_providers_updated_at 
  BEFORE UPDATE ON public.providers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. RLS Policies
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;

-- Service Categories Policies
DROP POLICY IF EXISTS "service_categories_select_active" ON public.service_categories;
CREATE POLICY "service_categories_select_active" ON public.service_categories
  FOR SELECT USING (is_active = true);

-- Profiles Policies
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
CREATE POLICY "profiles_select_all" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Providers Policies
DROP POLICY IF EXISTS "providers_select_active" ON public.providers;
CREATE POLICY "providers_select_active" ON public.providers
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "providers_insert_own" ON public.providers;
CREATE POLICY "providers_insert_own" ON public.providers
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "providers_update_own" ON public.providers;
CREATE POLICY "providers_update_own" ON public.providers
  FOR UPDATE USING (auth.uid() = id);

-- Grant Permissions
GRANT ALL ON public.service_categories TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.providers TO authenticated;
