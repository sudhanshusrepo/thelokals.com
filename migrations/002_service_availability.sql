
-- migrations/002_service_availability.sql

-- 1. Services Catalog
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,  -- e.g., 'PLUMBING', 'CLEANING'
    is_globally_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Hierarchical Availability Rules
CREATE TABLE IF NOT EXISTS service_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    scope_type VARCHAR(10) CHECK (scope_type IN ('STATE','CITY','PINCODE')),
    scope_id UUID NOT NULL,
    is_enabled BOOLEAN NOT NULL,
    priority INT CHECK (priority IN (1,2,3)),  -- STATE=1, CITY=2, PINCODE=3
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(service_id, scope_type, scope_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sa_service_scope ON service_availability(service_id, scope_type, scope_id);
CREATE INDEX IF NOT EXISTS idx_sa_priority ON service_availability(priority DESC);

-- 3. RPC Function to Resolve Availability
CREATE OR REPLACE FUNCTION resolve_service_availability(
  p_service_code VARCHAR,
  p_pincode CHAR(6)
) RETURNS TABLE (
  service_code VARCHAR,
  pincode CHAR(6),
  is_enabled BOOLEAN,
  resolved_scope VARCHAR,
  scope_name VARCHAR
) AS $$
DECLARE
  v_service_id UUID;
  v_global_enabled BOOLEAN;
  v_pincode_id UUID;
  v_city_id UUID;
  v_state_id UUID;
  v_city_name VARCHAR;
  v_state_name VARCHAR;
BEGIN
    -- 1. Get Service Info
    SELECT id, is_globally_enabled INTO v_service_id, v_global_enabled
    FROM services WHERE code = p_service_code;
    
    IF v_service_id IS NULL THEN
        RETURN QUERY SELECT p_service_code, p_pincode, false, 'NOT_FOUND'::VARCHAR, 'Unknown Service'::VARCHAR;
        RETURN;
    END IF;

    -- 2. Resolve Hierarchy
    -- Note: using current schema where pincodes has state_id, or joining cities/states
    -- We'll explicitly join to be safe and get names
    SELECT p.id, p.city_id, c.state_id, p.area_name, c.name, s.name
    INTO v_pincode_id, v_city_id, v_state_id, scope_name, v_city_name, v_state_name
    FROM pincodes p
    JOIN cities c ON p.city_id = c.id
    JOIN states s ON c.state_id = s.id
    WHERE p.pincode = p_pincode;

    IF v_pincode_id IS NULL THEN
         RETURN QUERY SELECT p_service_code, p_pincode, false, 'INVALID_PINCODE'::VARCHAR, 'Unknown Pincode'::VARCHAR;
         RETURN;
    END IF;

    -- 3. Query Rules (Highest Priority First)
    RETURN QUERY
    WITH rules AS (
        SELECT sa.is_enabled, sa.scope_type, sa.priority
        FROM service_availability sa
        WHERE sa.service_id = v_service_id
          AND (
               (sa.scope_type = 'PINCODE' AND sa.scope_id = v_pincode_id) OR
               (sa.scope_type = 'CITY' AND sa.scope_id = v_city_id) OR
               (sa.scope_type = 'STATE' AND sa.scope_id = v_state_id)
          )
        ORDER BY sa.priority DESC
        LIMIT 1
    )
    SELECT 
        p_service_code, 
        p_pincode, 
        COALESCE(r.is_enabled, v_global_enabled),
        COALESCE(r.scope_type, 'GLOBAL'),
        CASE 
            WHEN r.scope_type = 'PINCODE' THEN scope_name -- Pincode area name
            WHEN r.scope_type = 'CITY' THEN v_city_name
            WHEN r.scope_type = 'STATE' THEN v_state_name
            ELSE 'Global Default'
        END::VARCHAR
    FROM (SELECT 1) dummy
    LEFT JOIN rules r ON true;

END;
$$ LANGUAGE plpgsql;
