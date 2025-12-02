-- 04_dynamic_pricing.sql
-- Dynamic Pricing Engine: Base Prices, Location Zones, Analytics, Competitor Prices

-- 1. Base Prices Table
DROP TABLE IF EXISTS public.base_prices CASCADE;
CREATE TABLE public.base_prices (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_category text NOT NULL,
  service_type text NOT NULL,
  base_price decimal(10,2) NOT NULL,
  price_unit text DEFAULT 'per_service',
  effective_from timestamptz DEFAULT now(),
  effective_until timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(service_category, service_type, effective_from)
);

-- 2. Timing Multipliers Table
DROP TABLE IF EXISTS public.timing_multipliers CASCADE;
CREATE TABLE public.timing_multipliers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  time_category text NOT NULL,
  day_of_week integer,
  hour_start integer,
  hour_end integer,
  multiplier decimal(4,2) NOT NULL DEFAULT 1.0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CHECK (day_of_week IS NULL OR (day_of_week >= 0 AND day_of_week <= 6)),
  CHECK (hour_start IS NULL OR (hour_start >= 0 AND hour_start <= 23)),
  CHECK (hour_end IS NULL OR (hour_end >= 0 AND hour_end <= 23))
);

-- 3. Location Zones Table
DROP TABLE IF EXISTS public.location_zones CASCADE;
CREATE TABLE public.location_zones (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  zone_name text NOT NULL,
  city text NOT NULL,
  tier integer NOT NULL,
  geo_boundary geography(POLYGON, 4326),
  price_multiplier decimal(4,2) DEFAULT 1.0,
  socio_economic_index decimal(4,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(zone_name, city)
);

-- 4. Competitor Prices Table
DROP TABLE IF EXISTS public.competitor_prices CASCADE;
CREATE TABLE public.competitor_prices (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_category text NOT NULL,
  service_type text NOT NULL,
  competitor_name text NOT NULL,
  price decimal(10,2) NOT NULL,
  location text,
  scraped_at timestamptz DEFAULT now(),
  source_url text,
  created_at timestamptz DEFAULT now()
);

-- 5. Pricing History Table
DROP TABLE IF EXISTS public.pricing_history CASCADE;
CREATE TABLE public.pricing_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id uuid REFERENCES public.bookings(id),
  service_category text NOT NULL,
  service_type text,
  base_price decimal(10,2) NOT NULL,
  timing_multiplier decimal(4,2) DEFAULT 1.0,
  location_multiplier decimal(4,2) DEFAULT 1.0,
  demand_multiplier decimal(4,2) DEFAULT 1.0,
  ai_adjustment decimal(10,2) DEFAULT 0,
  final_price decimal(10,2) NOT NULL,
  calculation_metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- 6. Booking Analytics Materialized View (with corrected JSONB extraction)
DROP MATERIALIZED VIEW IF EXISTS public.booking_analytics CASCADE;
CREATE MATERIALIZED VIEW public.booking_analytics AS
SELECT 
  service_category,
  requirements->>'serviceType' as service_type,
  DATE_TRUNC('hour', created_at) as time_bucket,
  COUNT(*) as booking_count,
  AVG(estimated_cost) as avg_price,
  COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed_count,
  COUNT(*) FILTER (WHERE status = 'CANCELLED') as cancelled_count,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY estimated_cost) as median_price
FROM public.bookings
WHERE created_at > now() - INTERVAL '30 days'
GROUP BY service_category, requirements->>'serviceType', time_bucket;

-- 7. Indexes
CREATE INDEX IF NOT EXISTS idx_base_prices_category ON public.base_prices(service_category, service_type);
CREATE INDEX IF NOT EXISTS idx_base_prices_active ON public.base_prices(service_category, service_type, effective_until);

CREATE INDEX IF NOT EXISTS idx_timing_multipliers_category ON public.timing_multipliers(time_category);
CREATE INDEX IF NOT EXISTS idx_timing_multipliers_lookup ON public.timing_multipliers(day_of_week, hour_start, hour_end) WHERE day_of_week IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_location_zones_city ON public.location_zones(city);
CREATE INDEX IF NOT EXISTS idx_location_zones_geo ON public.location_zones USING GIST (geo_boundary);

CREATE INDEX IF NOT EXISTS idx_competitor_prices_category ON public.competitor_prices(service_category, service_type);
CREATE INDEX IF NOT EXISTS idx_competitor_prices_scraped ON public.competitor_prices(scraped_at DESC);

CREATE INDEX IF NOT EXISTS idx_pricing_history_booking ON public.pricing_history(booking_id);
CREATE INDEX IF NOT EXISTS idx_pricing_history_category ON public.pricing_history(service_category, created_at DESC);

-- 8. Functions

-- Get Location Zone
CREATE OR REPLACE FUNCTION get_location_zone(
  p_latitude decimal,
  p_longitude decimal,
  p_city text
)
RETURNS TABLE (
  zone_id uuid,
  zone_name text,
  tier integer,
  price_multiplier decimal
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lz.id,
    lz.zone_name,
    lz.tier,
    lz.price_multiplier
  FROM public.location_zones lz
  WHERE 
    lz.city = p_city
    AND ST_Contains(
      lz.geo_boundary::geometry,
      ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)
    )
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

-- Refresh Booking Analytics
CREATE OR REPLACE FUNCTION refresh_booking_analytics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public.booking_analytics;
END;
$$ LANGUAGE plpgsql;

-- 9. Triggers
DROP TRIGGER IF EXISTS update_base_prices_updated_at ON public.base_prices;
CREATE TRIGGER update_base_prices_updated_at
  BEFORE UPDATE ON public.base_prices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_timing_multipliers_updated_at ON public.timing_multipliers;
CREATE TRIGGER update_timing_multipliers_updated_at
  BEFORE UPDATE ON public.timing_multipliers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_location_zones_updated_at ON public.location_zones;
CREATE TRIGGER update_location_zones_updated_at
  BEFORE UPDATE ON public.location_zones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 10. RLS Policies
ALTER TABLE public.base_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timing_multipliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_history ENABLE ROW LEVEL SECURITY;

-- Base Prices Policies (Read-only for authenticated users)
DROP POLICY IF EXISTS "base_prices_select_all" ON public.base_prices;
CREATE POLICY "base_prices_select_all" ON public.base_prices
  FOR SELECT USING (true);

-- Timing Multipliers Policies
DROP POLICY IF EXISTS "timing_multipliers_select_all" ON public.timing_multipliers;
CREATE POLICY "timing_multipliers_select_all" ON public.timing_multipliers
  FOR SELECT USING (true);

-- Location Zones Policies
DROP POLICY IF EXISTS "location_zones_select_all" ON public.location_zones;
CREATE POLICY "location_zones_select_all" ON public.location_zones
  FOR SELECT USING (true);

-- Competitor Prices Policies
DROP POLICY IF EXISTS "competitor_prices_select_all" ON public.competitor_prices;
CREATE POLICY "competitor_prices_select_all" ON public.competitor_prices
  FOR SELECT USING (true);

-- Pricing History Policies
DROP POLICY IF EXISTS "pricing_history_select_all" ON public.pricing_history;
CREATE POLICY "pricing_history_select_all" ON public.pricing_history
  FOR SELECT USING (true);

-- Grant Permissions
GRANT ALL ON public.base_prices TO authenticated;
GRANT ALL ON public.timing_multipliers TO authenticated;
GRANT ALL ON public.location_zones TO authenticated;
GRANT ALL ON public.competitor_prices TO authenticated;
GRANT ALL ON public.pricing_history TO authenticated;
GRANT SELECT ON public.booking_analytics TO authenticated;

-- Comments
COMMENT ON TABLE public.base_prices IS 'Base pricing for different service categories and types';
COMMENT ON TABLE public.timing_multipliers IS 'Time-based pricing multipliers (peak hours, weekends, etc.)';
COMMENT ON TABLE public.location_zones IS 'Geographic zones with location-based pricing multipliers';
COMMENT ON TABLE public.competitor_prices IS 'Competitor pricing data for market analysis';
COMMENT ON TABLE public.pricing_history IS 'Historical record of all pricing calculations';
COMMENT ON MATERIALIZED VIEW public.booking_analytics IS 'Aggregated booking metrics for demand-based pricing';
