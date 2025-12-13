-- Drop the old function with geography parameter
DROP FUNCTION IF EXISTS find_nearby_providers(geography, text, numeric, integer);

-- Create new function with numeric lat/long parameters matching client call
CREATE OR REPLACE FUNCTION find_nearby_providers(
  lat numeric,
  long numeric,
  service_category text,
  radius_km numeric DEFAULT 10
)
RETURNS TABLE (
  provider_id uuid,
  provider_name text,
  distance_km numeric,
  rating numeric,
  total_jobs integer,
  is_verified boolean
) AS $$
DECLARE
  p_location geography;
BEGIN
  -- Construct geography point from lat/long (long, lat order for PostGIS)
  p_location := ST_SetSRID(ST_MakePoint(long, lat), 4326)::geography;

  RETURN QUERY
  SELECT 
    p.id as provider_id,
    p.full_name as provider_name,
    ROUND((ST_Distance(p.operating_location, p_location) / 1000)::numeric, 2) as distance_km,
    p.rating_average as rating,
    p.total_jobs,
    p.is_verified
  FROM public.providers p
  WHERE 
    p.is_active = true
    AND p.category = service_category
    AND ST_DWithin(p.operating_location, p_location, radius_km * 1000)
  ORDER BY 
    p.is_verified DESC,
    p.rating_average DESC,
    distance_km ASC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
