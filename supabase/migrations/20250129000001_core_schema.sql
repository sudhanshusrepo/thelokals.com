-- Migration: Core Schema Setup
-- Description: Create service categories and providers tables with PostGIS support
-- Phase: 1 of 6
-- Idempotent: Safe to re-run

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- Drop existing objects to ensure clean state
DROP TABLE IF EXISTS public.service_categories CASCADE;
DROP TABLE IF EXISTS public.providers CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_service_categories_group;
DROP INDEX IF EXISTS idx_service_categories_active;
DROP INDEX IF EXISTS idx_providers_location;
DROP INDEX IF EXISTS idx_providers_category;
DROP INDEX IF EXISTS idx_providers_active;
DROP INDEX IF EXISTS idx_providers_rating;

-- Service Categories Table
CREATE TABLE public.service_categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  group_name text NOT NULL,
  icon text,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Providers Table (replaces old workers table)
CREATE TABLE public.providers (
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

-- Profiles Table
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
  full_name text,
  phone text,
  email text,
  avatar_url text,
  address jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_service_categories_group ON public.service_categories(group_name);
CREATE INDEX idx_service_categories_active ON public.service_categories(is_active);
CREATE INDEX idx_providers_location ON public.providers USING GIST (operating_location);
CREATE INDEX idx_providers_category ON public.providers(category);
CREATE INDEX idx_providers_active ON public.providers(is_active, is_verified);
CREATE INDEX idx_providers_rating ON public.providers(rating_average DESC);

-- Enable RLS on new tables
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Insert service categories based on current app structure
INSERT INTO public.service_categories (name, group_name, icon, description) VALUES
  ('Plumber', 'Home Care & Repair', '🔧', 'Fix maintain and improve your home with trusted professionals.'),
  ('Electrician', 'Home Care & Repair', '⚡', 'Fix maintain and improve your home with trusted professionals.'),
  ('Carpenter', 'Home Care & Repair', '🔨', 'Fix maintain and improve your home with trusted professionals.'),
  ('Painter', 'Home Care & Repair', '🎨', 'Fix maintain and improve your home with trusted professionals.'),
  ('Appliance Repair', 'Home Care & Repair', '🔧', 'Fix maintain and improve your home with trusted professionals.'),
  ('Locksmith', 'Home Care & Repair', '🔑', 'Fix maintain and improve your home with trusted professionals.'),
  ('Pest Control', 'Home Care & Repair', '🐛', 'Fix maintain and improve your home with trusted professionals.'),
  ('Gardener', 'Home Care & Repair', '🌱', 'Fix maintain and improve your home with trusted professionals.'),
  
  ('Maid Service', 'Cleaning & Logistics', '🧹', 'Keep your space spotless and manage moves with ease.'),
  ('House Cleaning', 'Cleaning & Logistics', '🏠', 'Keep your space spotless and manage moves with ease.'),
  ('Laundry Service', 'Cleaning & Logistics', '🧺', 'Keep your space spotless and manage moves with ease.'),
  ('Packers & Movers', 'Cleaning & Logistics', '📦', 'Keep your space spotless and manage moves with ease.'),
  ('Car Washing', 'Cleaning & Logistics', '🚗', 'Keep your space spotless and manage moves with ease.'),
  
  ('Mechanic', 'Auto & Transportation', '🔧', 'Keep your vehicles running smoothly and get where you need to go.'),
  ('Driver', 'Auto & Transportation', '🚗', 'Keep your vehicles running smoothly and get where you need to go.'),
  ('Bike Repair', 'Auto & Transportation', '🚲', 'Keep your vehicles running smoothly and get where you need to go.'),
  ('Roadside Assistance', 'Auto & Transportation', '🛠️', 'Keep your vehicles running smoothly and get where you need to go.');

-- Create or replace updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_service_categories_updated_at 
  BEFORE UPDATE ON public.service_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_providers_updated_at 
  BEFORE UPDATE ON public.providers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
