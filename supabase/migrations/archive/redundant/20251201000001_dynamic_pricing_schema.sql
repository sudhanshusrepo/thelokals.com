-- Dynamic Pricing Engine Schema

-- Enable PostGIS if not already enabled (should be from previous setup, but good to ensure)
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Base Prices Table
CREATE TABLE IF NOT EXISTS base_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_category TEXT NOT NULL,
  service_type TEXT NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  effective_from TIMESTAMPTZ DEFAULT NOW(),
  effective_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(service_category, service_type, effective_from)
);

CREATE INDEX IF NOT EXISTS idx_base_prices_active ON base_prices(service_category, service_type, effective_until);

-- 2. Timing Multipliers Table
CREATE TABLE IF NOT EXISTS timing_multipliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  time_segment TEXT NOT NULL, -- 'morning', 'afternoon', 'evening', 'night'
  day_type TEXT NOT NULL, -- 'weekday', 'weekend', 'holiday'
  multiplier DECIMAL(4,2) NOT NULL,
  start_hour INTEGER NOT NULL,
  end_hour INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(time_segment, day_type)
);

-- Seed data for timing multipliers
INSERT INTO timing_multipliers (time_segment, day_type, multiplier, start_hour, end_hour) VALUES
('morning', 'weekday', 1.0, 6, 12),
('afternoon', 'weekday', 1.1, 12, 17),
('evening', 'weekday', 1.3, 17, 21),
('night', 'weekday', 1.5, 21, 6),
('morning', 'weekend', 1.2, 6, 12),
('afternoon', 'weekend', 1.3, 12, 17),
('evening', 'weekend', 1.4, 17, 21),
('night', 'weekend', 1.6, 21, 6)
ON CONFLICT (time_segment, day_type) DO NOTHING;

-- 3. Location Zones Table
CREATE TABLE IF NOT EXISTS location_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zone_name TEXT NOT NULL,
  city TEXT NOT NULL,
  tier INTEGER NOT NULL, -- 1, 2, 3 (metro, tier-2, tier-3)
  geo_boundary GEOGRAPHY(POLYGON, 4326),
  price_multiplier DECIMAL(4,2) DEFAULT 1.0,
  socio_economic_index DECIMAL(4,2), -- 0.5 to 2.0
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(zone_name, city)
);

CREATE INDEX IF NOT EXISTS idx_location_zones_geo ON location_zones USING GIST(geo_boundary);

-- Helper function to get location zone
CREATE OR REPLACE FUNCTION get_location_zone(lat DOUBLE PRECISION, lng DOUBLE PRECISION)
RETURNS TABLE(zone_name TEXT, price_multiplier DECIMAL, socio_economic_index DECIMAL) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lz.zone_name,
    lz.price_multiplier,
    lz.socio_economic_index
  FROM location_zones lz
  WHERE ST_Contains(lz.geo_boundary::geometry, ST_SetSRID(ST_MakePoint(lng, lat), 4326))
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- 4. Competitor Prices Table
CREATE TABLE IF NOT EXISTS competitor_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competitor_name TEXT NOT NULL,
  service_category TEXT NOT NULL,
  service_type TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  location TEXT,
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  source_url TEXT,
  metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_competitor_prices_recent ON competitor_prices(service_category, service_type, scraped_at DESC);

-- 5. Pricing History Table
CREATE TABLE IF NOT EXISTS pricing_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id),
  service_category TEXT NOT NULL,
  service_type TEXT NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  final_price DECIMAL(10,2) NOT NULL,
  multipliers JSONB, -- {timing: 1.3, location: 1.1, demand: 1.2, ai_adjustment: 0.95}
  competitor_avg_price DECIMAL(10,2),
  accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pricing_history_analytics ON pricing_history(service_category, created_at DESC, accepted);

-- 6. Booking Analytics Materialized View
CREATE MATERIALIZED VIEW IF NOT EXISTS booking_analytics AS
SELECT 
  service_category,
  requirements->>'serviceType' as service_type,
  DATE_TRUNC('hour', created_at) as time_bucket,
  COUNT(*) as booking_count,
  AVG(estimated_cost) as avg_price,
  COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed_count,
  COUNT(*) FILTER (WHERE status = 'CANCELLED') as cancelled_count,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY estimated_cost) as median_price
FROM bookings
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY service_category, requirements->>'serviceType', time_bucket;

CREATE INDEX IF NOT EXISTS idx_booking_analytics_lookup ON booking_analytics(service_category, service_type, time_bucket DESC);

-- Function to refresh analytics
CREATE OR REPLACE FUNCTION refresh_booking_analytics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY booking_analytics;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies (Basic security)
ALTER TABLE base_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE timing_multipliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_history ENABLE ROW LEVEL SECURITY;

-- Allow public read access for pricing calculation (or restrict to service role if strictly backend)
-- For now, allowing authenticated users to read base prices and multipliers
CREATE POLICY "Public read access for base prices" ON base_prices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public read access for timing multipliers" ON timing_multipliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public read access for location zones" ON location_zones FOR SELECT TO authenticated USING (true);

-- Only service role can write to these tables
CREATE POLICY "Service role write access" ON base_prices FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role write access" ON timing_multipliers FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role write access" ON location_zones FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON competitor_prices FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON pricing_history FOR ALL TO service_role USING (true) WITH CHECK (true);
