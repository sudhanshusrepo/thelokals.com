-- Migration: Phase 4 - Local Services MVP
-- Description: Add geospatial columns for providers and indexes for location-based queries

-- 1. Ensure PostGIS is enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Update providers table with location and radius
ALTER TABLE providers 
ADD COLUMN IF NOT EXISTS location GEOGRAPHY(POINT, 4326),
ADD COLUMN IF NOT EXISTS search_radius_km INTEGER DEFAULT 10;

-- 3. Create Geospatial Indexes
-- Index for finding providers near a booking location
CREATE INDEX IF NOT EXISTS idx_providers_location ON providers USING GIST(location);

-- Index for analytics on booking locations
CREATE INDEX IF NOT EXISTS idx_bookings_location ON bookings USING GIST(location);

-- 4. RPC: Find Nearby Providers
-- Efficiently Query providers within radius who offer the required service
CREATE OR REPLACE FUNCTION find_nearby_providers(
  p_service_category TEXT,
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_radius_km DOUBLE PRECISION DEFAULT 10
) RETURNS TABLE (
  id UUID,
  user_id UUID,
  distance_km DOUBLE PRECISION,
  services TEXT[],
  city TEXT,
  availability_schedule JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    (ST_Distance(p.location, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)) / 1000) AS distance_km,
    p.services,
    p.city,
    p.availability_schedule
  FROM providers p
  WHERE 
    p.is_active = true
    AND p_service_category = ANY(p.services)
    AND ST_DWithin(
      p.location, 
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326), 
      p_radius_km * 1000 -- Convert km to meters
    )
    AND ST_DWithin(
      p.location, 
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326), 
      (p.search_radius_km * 1000) -- Check provided radius as well
    )
  ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql;

-- 5. RPC: Update Provider Location
-- Simple helper to update location from lat/lng
CREATE OR REPLACE FUNCTION update_provider_location(
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION
) RETURNS VOID AS $$
BEGIN
  UPDATE providers
  SET location = ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326),
      updated_at = NOW()
  WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql;
