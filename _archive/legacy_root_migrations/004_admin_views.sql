
-- migrations/004_admin_views.sql
-- Admin Views and RPCs for Geo Availability

-- 1. Geo Hierarchy View
-- This view helps in fetching the tree structure with current availability status
-- Optimization: Using LATERAL joins or aggregated JSON might be better for full tree,
-- but for drill-down (fetch states, then fetch cities for state), simple queries are fine.
-- This view flattens the availability for easy joining.

CREATE OR REPLACE VIEW geo_hierarchy_scaffold AS
SELECT 
  s.id as state_id, s.name as state_name,
  c.id as city_id, c.name as city_name,
  p.id as pincode_id, p.pincode, p.area_name
FROM pincodes p
JOIN cities c ON p.city_id = c.id
JOIN states s ON c.state_id = s.id;

-- 2. Toggle Service Availability RPC
-- This function handles inserting or updating the rule.
-- The trigger from m003 will handle invalidation automatically.

CREATE OR REPLACE FUNCTION toggle_service_availability(
  p_service_id UUID,
  p_scope_type VARCHAR, -- 'STATE', 'CITY', 'PINCODE'
  p_scope_id UUID,
  p_is_enabled BOOLEAN
) RETURNS VOID AS $$
DECLARE
  v_priority INTEGER;
BEGIN
  -- Determine Priority
  IF p_scope_type = 'STATE' THEN
      v_priority := 1;
  ELSIF p_scope_type = 'CITY' THEN
      v_priority := 2;
  ELSIF p_scope_type = 'PINCODE' THEN
      v_priority := 3;
  ELSE
      RAISE EXCEPTION 'Invalid scope type: %', p_scope_type;
  END IF;

  -- Upsert Rule
  INSERT INTO service_availability (service_id, scope_type, scope_id, is_enabled, priority)
  VALUES (p_service_id, p_scope_type, p_scope_id, p_is_enabled, v_priority)
  ON CONFLICT (service_id, scope_type, scope_id)
  DO UPDATE SET 
    is_enabled = EXCLUDED.is_enabled,
    created_at = NOW(); -- Touch timestamp for debugging
END;
$$ LANGUAGE plpgsql;
