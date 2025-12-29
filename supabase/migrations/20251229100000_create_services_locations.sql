-- Create services_locations table for location-based service enablement
-- Migration: 20251229100000_create_services_locations.sql
-- Purpose: Enable AC Repair service for Gurugram and Navi Mumbai with production mode

BEGIN;

-- Create services_locations table
CREATE TABLE IF NOT EXISTS services_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_category_id UUID REFERENCES service_categories(id) ON DELETE CASCADE,
  location_name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  lat_lng_bounds GEOGRAPHY(POLYGON),
  enabled BOOLEAN DEFAULT false,
  production_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(service_category_id, location_name)
);

-- Enable RLS
ALTER TABLE services_locations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can view enabled services"
  ON services_locations FOR SELECT
  USING (enabled = true AND production_mode = true);

CREATE POLICY "Admins can manage all"
  ON services_locations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  );

-- Seed data for Gurugram AC Repair
INSERT INTO services_locations (service_category_id, location_name, city, state, enabled, production_mode)
SELECT 
  sc.id,
  'Gurugram',
  'Gurugram',
  'Haryana',
  true,
  true
FROM service_categories sc
WHERE sc.name ILIKE '%AC%' OR sc.name ILIKE '%Air%' OR sc.name ILIKE '%Appliance%'
ON CONFLICT (service_category_id, location_name) DO UPDATE SET
  enabled = EXCLUDED.enabled,
  production_mode = EXCLUDED.production_mode;

-- Seed data for Navi Mumbai AC Repair
INSERT INTO services_locations (service_category_id, location_name, city, state, enabled, production_mode)
SELECT 
  sc.id,
  'Navi Mumbai',
  'Navi Mumbai',
  'Maharashtra',
  true,
  true
FROM service_categories sc
WHERE sc.name ILIKE '%AC%' OR sc.name ILIKE '%Air%' OR sc.name ILIKE '%Appliance%'
ON CONFLICT (service_category_id, location_name) DO UPDATE SET
  enabled = EXCLUDED.enabled,
  production_mode = EXCLUDED.production_mode;

COMMIT;
