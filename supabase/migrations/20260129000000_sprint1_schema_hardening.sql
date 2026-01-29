-- Sprint 1: Schema Hardening
-- Goal: Optimize Geospatial queries and ensure Atomic Booking integrity

BEGIN;

-- 1. Optimize Providers Location Index (GiST)
-- We use COALESCE to ensure we don't index nulls if that's an issue, but standard GiST handles it.
-- We cast to geography(POINT) to ensure the index type matches our queries.
CREATE INDEX IF NOT EXISTS idx_providers_location_gist ON providers USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_providers_is_online_gist ON providers (is_online);

-- 2. Optimize Booking Requests Indices
-- Critical for the 'Fan-out' check and 'Accept' updates
CREATE INDEX IF NOT EXISTS idx_booking_requests_booking_id ON booking_requests(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_provider_id ON booking_requests(provider_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_status ON booking_requests(status);


-- 3. RPC: Update Provider Location (Lightweight)
-- Matches: platform-core/src/services/geoService.ts
CREATE OR REPLACE FUNCTION update_provider_location(
    p_lat DOUBLE PRECISION,
    p_lng DOUBLE PRECISION
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_provider_id UUID;
BEGIN
    -- Get provider ID linked to the auth user
    SELECT id INTO v_provider_id
    FROM providers
    WHERE user_id = auth.uid();

    IF v_provider_id IS NULL THEN
        RAISE EXCEPTION 'Provider profile not found for user';
    END IF;

    -- Update location and last_active timestamp
    UPDATE providers
    SET 
        location = ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
        last_active_at = NOW(),
        is_online = true -- Auto-online on move? Discuss logic. For now, yes, or just update time.
    WHERE id = v_provider_id;
END;
$$;


-- 4. RPC: Find Nearby Providers (Optimized)
-- Uses ST_DWithin which leverages the GiST index
CREATE OR REPLACE FUNCTION find_nearby_providers(
    p_service_id UUID, -- This is actually p_service_category_id
    p_lat DOUBLE PRECISION,
    p_lng DOUBLE PRECISION,
    p_max_distance DOUBLE PRECISION DEFAULT 10000 -- Meters
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    category TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    distance DOUBLE PRECISION,
    price DOUBLE PRECISION,
    rating DOUBLE PRECISION,
    review_count INT,
    image_url TEXT,
    is_verified BOOLEAN,
    provider_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_loc GEOGRAPHY;
BEGIN
    v_user_loc := ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography;

    RETURN QUERY
    SELECT 
        p.id, -- matches interface 'id' but actually provider_id. 
        pro.full_name as name,
        sc.name as category,
        ST_Y(p.location::geometry) as lat,
        ST_X(p.location::geometry) as lng,
        ST_Distance(p.location, v_user_loc) as distance,
        COALESCE(p.price_per_hour, 0) as price,
        COALESCE(p.rating, 0) as rating,
        COALESCE(p.review_count, 0) as review_count,
        COALESCE(pro.avatar_url, '') as image_url,
        p.is_verified,
        p.id as provider_id
    FROM providers p
    JOIN profiles pro ON p.user_id = pro.id
    JOIN service_categories sc ON p.category_id = sc.id
    WHERE 
        p.category_id = p_service_id
        AND p.is_online = true 
        AND p.status = 'APPROVED'
        AND ST_DWithin(p.location, v_user_loc, p_max_distance) -- Index usage!
    ORDER BY p.location <-> v_user_loc -- Nearest Neighbor optimization
    LIMIT 50;
END;
$$;

-- 5. RPC: Create Booking Requests (Fan Out)
-- Ensures idempotency
CREATE OR REPLACE FUNCTION create_booking_requests(
  p_booking_id UUID,
  p_provider_ids UUID[]
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO booking_requests (booking_id, provider_id, status, expires_at)
  SELECT 
    p_booking_id, 
    unnest(p_provider_ids), 
    'PENDING',
    NOW() + INTERVAL '45 seconds' -- Request TTL
  ON CONFLICT (booking_id, provider_id) DO NOTHING;
END;
$$;

COMMIT;
