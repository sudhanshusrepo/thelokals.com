-- Seed Data for Location Hierarchy (Bangalore Pilot)
-- Date: 2025-12-19

BEGIN;

-- 1. L1: Country (India)
INSERT INTO public.locations (id, hierarchy_level, name, center_lat, center_lng, polygon)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', -- uuid
    'L1_COUNTRY',
    'India',
    20.5937, 78.9629,
    ST_SetSRID(ST_MakePolygon(ST_GeomFromText('LINESTRING(68 7, 97 7, 97 35, 68 35, 68 7)')), 4326) -- Approximate bounding box
) ON CONFLICT (hierarchy_level, name, parent_id) DO NOTHING;

-- 2. L2: Region (Karnataka)
INSERT INTO public.locations (id, hierarchy_level, name, parent_id, center_lat, center_lng)
VALUES (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'L2_REGION',
    'Karnataka',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', -- Parent: India
    15.3173, 75.7139
) ON CONFLICT (hierarchy_level, name, parent_id) DO NOTHING;

-- 3. L3: City (Bangalore)
INSERT INTO public.locations (
    id, hierarchy_level, name, parent_id, center_lat, center_lng, 
    enabled_services, population, is_emergency_disabled
)
VALUES (
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'L3_CITY',
    'Bangalore',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', -- Parent: Karnataka
    12.9716, 77.5946,
    '["plumbing", "electrical", "ac_repair", "cleaning"]', -- Enabled M1 Services
    8443675,
    false
) ON CONFLICT (hierarchy_level, name, parent_id) DO NOTHING;

-- 4. L4: Zones (Indiranagar & Koramangala)
-- Indiranagar Zone
INSERT INTO public.locations (id, hierarchy_level, name, parent_id, center_lat, center_lng, polygon)
VALUES (
    'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    'L4_ZONE',
    'Indiranagar',
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', -- Parent: Bangalore
    12.9784, 77.6408,
    -- Simple polygon for Indiranagar
    ST_SetSRID(ST_MakePolygon(ST_GeomFromText('LINESTRING(77.63 12.97, 77.65 12.97, 77.65 12.99, 77.63 12.99, 77.63 12.97)')), 4326)
) ON CONFLICT (hierarchy_level, name, parent_id) DO NOTHING;

-- Koramangala Zone
INSERT INTO public.locations (id, hierarchy_level, name, parent_id, center_lat, center_lng, polygon)
VALUES (
    'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    'L4_ZONE',
    'Koramangala',
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', -- Parent: Bangalore
    12.9352, 77.6245,
    -- Simple polygon for Koramangala
    ST_SetSRID(ST_MakePolygon(ST_GeomFromText('LINESTRING(77.61 12.92, 77.64 12.92, 77.64 12.95, 77.61 12.95, 77.61 12.92)')), 4326)
) ON CONFLICT (hierarchy_level, name, parent_id) DO NOTHING;

-- 5. L5: Pincodes
-- Indiranagar Pincode (560038)
INSERT INTO public.locations (id, hierarchy_level, name, parent_id, center_lat, center_lng)
VALUES (
    'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
    'L5_PINCODE',
    '560038',
    'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', -- Parent: Indiranagar
    12.9784, 77.6408
) ON CONFLICT (hierarchy_level, name, parent_id) DO NOTHING;

-- Koramangala Pincode (560034)
INSERT INTO public.locations (id, hierarchy_level, name, parent_id, center_lat, center_lng)
VALUES (
    'g6eebc99-9c0b-4ef8-bb6d-6bb9bd380a77',
    'L5_PINCODE',
    '560034',
    'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', -- Parent: Koramangala
    12.9352, 77.6245
) ON CONFLICT (hierarchy_level, name, parent_id) DO NOTHING;


-- Seed Services (M1 Launch)
-- Plumbing
INSERT INTO public.services (code, name, category, base_price_cents, duration_minutes_min, duration_minutes_max, enabled_globally)
VALUES ('plumbing', 'Plumbing Services', 'home_maintenance', 30000, 30, 60, true)
ON CONFLICT (code) DO NOTHING;

-- Electrical
INSERT INTO public.services (code, name, category, base_price_cents, duration_minutes_min, duration_minutes_max, enabled_globally)
VALUES ('electrical', 'Electrical Services', 'home_maintenance', 40000, 45, 90, true)
ON CONFLICT (code) DO NOTHING;

-- AC Repair
INSERT INTO public.services (code, name, category, base_price_cents, duration_minutes_min, duration_minutes_max, enabled_globally)
VALUES ('ac_repair', 'AC Repair', 'home_maintenance', 50000, 60, 120, true)
ON CONFLICT (code) DO NOTHING;

COMMIT;
