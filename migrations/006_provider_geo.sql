
-- migrations/006_provider_geo.sql
-- Provider Geo-Mapping: Linking Providers to specific Pincodes

-- 1. Create Drop Junction Table (provider_pincodes)
CREATE TABLE IF NOT EXISTS provider_pincodes (
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    pincode_id UUID REFERENCES pincodes(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (provider_id, pincode_id)
);

-- Index for fast lookup by pincode (Critical for "Show providers in this area")
CREATE INDEX IF NOT EXISTS idx_provider_pincodes_pincode_id ON provider_pincodes(pincode_id);
-- Index for fast lookup by provider (Critical for "Show my service areas")
CREATE INDEX IF NOT EXISTS idx_provider_pincodes_provider_id ON provider_pincodes(provider_id);


-- 2. RPC: Get Providers for a Pincode
CREATE OR REPLACE FUNCTION get_providers_for_pincode(p_pincode_id UUID)
RETURNS TABLE (
    provider_id UUID,
    full_name VARCHAR,
    phone VARCHAR,
    category VARCHAR,
    status VARCHAR,
    is_active BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as provider_id,
        p.full_name,
        u.phone,    -- Join with users to get phone if needed, assuming providers links to users or has phone
        p.category,
        p.status,
        pp.is_active
    FROM 
        provider_pincodes pp
    JOIN 
        providers p ON pp.provider_id = p.id
    LEFT JOIN
        users u ON p.id = u.id -- Assuming provider.id is same as user.id (Profile pattern) OR provider has user_id
    WHERE 
        pp.pincode_id = p_pincode_id;
END;
$$;


-- 3. RPC: Assign Provider to Pincode
CREATE OR REPLACE FUNCTION assign_provider_to_pincode(p_provider_id UUID, p_pincode_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO provider_pincodes (provider_id, pincode_id)
    VALUES (p_provider_id, p_pincode_id)
    ON CONFLICT (provider_id, pincode_id) 
    DO UPDATE SET is_active = TRUE; -- Reactivate if it was there
END;
$$;


-- 4. RPC: Remove Provider from Pincode
CREATE OR REPLACE FUNCTION remove_provider_from_pincode(p_provider_id UUID, p_pincode_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM provider_pincodes
    WHERE provider_id = p_provider_id AND pincode_id = p_pincode_id;
END;
$$;

-- 5. RPC: Search Providers (Helper for the UI Modal)
-- Allows searching via Name or Phone to easily find a provider to add
CREATE OR REPLACE FUNCTION search_providers(p_query TEXT)
RETURNS TABLE (
    id UUID,
    full_name VARCHAR,
    phone VARCHAR,
    category VARCHAR
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.full_name,
        u.phone,
        p.category
    FROM 
        providers p
    LEFT JOIN
        users u ON p.id = u.id
    WHERE 
        p.full_name ILIKE '%' || p_query || '%' OR
        u.phone ILIKE '%' || p_query || '%'
    LIMIT 20;
END;
$$;
