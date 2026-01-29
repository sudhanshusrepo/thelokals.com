
-- migrations/005_prod_harden.sql
-- Production Hardening: Materialized Views and Indexes

-- 1. Effective Availability Materialized View
-- Optimizes the complex hierarchical lookup into a flat table for faster fallback RPC queries
-- or for batch analytic queries.
-- Note: The RPC 'resolve_service_availability' currently does the join live. 
-- In high-scale, we might switch the RPC to query this view.

CREATE MATERIALIZED VIEW effective_service_availability AS
SELECT 
  p.pincode,
  p.area_name,
  s.code as service_code,
  sa.is_enabled,
  sa.scope_type,
  sa.priority
FROM pincodes p
CROSS JOIN services s
LEFT JOIN service_availability sa ON (
  (sa.scope_type = 'PINCODE' AND sa.scope_id = p.id) OR
  (sa.scope_type = 'CITY' AND sa.scope_id = p.city_id) OR
  (sa.scope_type = 'STATE' AND sa.scope_id = p.state_id)
)
WHERE sa.service_id = s.id;

-- Index for fast lookup
CREATE INDEX idx_effective_availability_lookup 
ON effective_service_availability(service_code, pincode);

-- 2. Function to Refresh View
CREATE OR REPLACE FUNCTION refresh_effective_availability()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY effective_service_availability;
END;
$$ LANGUAGE plpgsql;

-- 3. Additional Indexes on base tables (Safety check)
CREATE INDEX IF NOT EXISTS idx_sa_service_scope 
ON service_availability(service_id, scope_type, scope_id);

CREATE INDEX IF NOT EXISTS idx_pincodes_hierarchy
ON pincodes(city_id, state_id);
