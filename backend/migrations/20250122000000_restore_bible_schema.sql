-- ============================================
-- THELOKALS.COM - RESTORE BIBLE ALIGNMENT SCHEMA
-- ============================================
-- Version: 1.1 (Restored)
-- Date: 2025-01-22
-- Description: Restores location hierarchy, pincode mapping, and services table.
-- ============================================

-- Location Hierarchy Enums
DO $$ BEGIN
    CREATE TYPE hierarchy_level AS ENUM ('L1_COUNTRY', 'L2_REGION', 'L3_CITY', 'L4_ZONE', 'L5_PINCODE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update Admin Roles Enum to match Bible
DO $$ BEGIN
    CREATE TYPE admin_role_v2 AS ENUM ('super_admin', 'india_head', 'region_head', 'city_head', 'service_manager');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Locations Table (L1-L5 Hierarchy)
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hierarchy_level hierarchy_level NOT NULL,
  name VARCHAR(255) NOT NULL,
  parent_id UUID REFERENCES public.locations(id),
  
  -- Geographic data
  center_lat DECIMAL(10,8),
  center_lng DECIMAL(11,8),
  polygon geography(Polygon, 4326),
  
  -- Service data
  enabled_services JSONB DEFAULT '[]', -- ["plumbing", "electrical"]
  service_prices JSONB DEFAULT '{}', -- {"plumbing": 350, "electrical": 400}
  surge_multiplier DECIMAL(3,2) DEFAULT 1.0,
  is_emergency_disabled BOOLEAN DEFAULT false,
  emergency_reason TEXT,
  emergency_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  population INT,
  provider_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(hierarchy_level, name, parent_id)
);

-- Ensure columns exist if table already existed (Fix for Idempotency)
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS is_emergency_disabled BOOLEAN DEFAULT false;
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS emergency_reason TEXT;
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS emergency_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS surge_multiplier DECIMAL(3,2) DEFAULT 1.0;


CREATE INDEX IF NOT EXISTS idx_locations_polygon ON public.locations USING GIST(polygon);
CREATE INDEX IF NOT EXISTS idx_locations_parent ON public.locations(parent_id);
CREATE INDEX IF NOT EXISTS idx_locations_level ON public.locations(hierarchy_level);
CREATE INDEX IF NOT EXISTS idx_locations_emergency ON public.locations(is_emergency_disabled);

-- Update Admin Users Table
ALTER TABLE public.admin_users 
ADD COLUMN IF NOT EXISTS role_v2 admin_role_v2 DEFAULT 'city_head',
ADD COLUMN IF NOT EXISTS assigned_region_id UUID REFERENCES public.locations(id),
ADD COLUMN IF NOT EXISTS assigned_city_id UUID REFERENCES public.locations(id),
ADD COLUMN IF NOT EXISTS assigned_service VARCHAR(50);

-- Pincodes Table (Detailed India-wide Mapping)
CREATE TABLE IF NOT EXISTS public.pincodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pincode VARCHAR(6) UNIQUE NOT NULL,
  area_name VARCHAR(255),
  city_id UUID REFERENCES public.locations(id),
  zone_id UUID REFERENCES public.locations(id),
  region_id UUID REFERENCES public.locations(id),
  
  -- Geographic data
  center_lat DECIMAL(10,8),
  center_lng DECIMAL(11,8),
  polygon geography(Polygon, 4326),
  
  -- Service availability
  enabled_services JSONB DEFAULT '[]',
  service_prices JSONB DEFAULT '{}',
  is_serviceable BOOLEAN DEFAULT false,
  
  -- Demand data
  historical_demand INT DEFAULT 0,
  provider_count INT DEFAULT 0,
  
  -- Metadata
  state VARCHAR(50),
  region VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pincode ON public.pincodes(pincode);
CREATE INDEX IF NOT EXISTS idx_city ON public.pincodes(city_id);
CREATE INDEX IF NOT EXISTS idx_zone ON public.pincodes(zone_id);
CREATE INDEX IF NOT EXISTS idx_pincodes_polygon ON public.pincodes USING GIST (polygon);

-- Services Table (Master Table from Bible)
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL, -- "plumbing", "ac_repair"
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100), -- "home_maintenance", "vehicle", "personal"
  
  -- Pricing
  base_price_cents INT NOT NULL, -- In paise
  dynamic_base_price_cents INT, -- Updated by ML crawler
  price_last_updated TIMESTAMP WITH TIME ZONE,
  
  -- Configuration
  duration_minutes_min INT DEFAULT 30,
  duration_minutes_max INT DEFAULT 120,
  
  -- Provider requirements
  min_rating DECIMAL(3,2) DEFAULT 0,
  min_bookings INT DEFAULT 0,
  requires_certification BOOLEAN DEFAULT false,
  required_documents JSONB DEFAULT '[]', -- ["digilocker_aadhaar", "certification"]
  
  -- Availability
  enabled_globally BOOLEAN DEFAULT false,
  enabled_cities JSONB DEFAULT '[]', -- ["gurugram", "bhopal"]
  
  -- Search & Status (Added to match seed)
  keywords TEXT[],
  is_active BOOLEAN DEFAULT true,

  -- Surge pricing
  surge_enabled BOOLEAN DEFAULT true,
  surge_multiplier_min DECIMAL(3,2) DEFAULT 1.0,
  surge_multiplier_max DECIMAL(3,2) DEFAULT 2.0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_services_code ON public.services(code);
CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(category);

-- Update Bookings Table
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS service_code VARCHAR(50) REFERENCES public.services(code),
ADD COLUMN IF NOT EXISTS service_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS service_description TEXT,
ADD COLUMN IF NOT EXISTS service_category_type VARCHAR(100), -- "leak", "pipe"
ADD COLUMN IF NOT EXISTS base_price_cents INT,
ADD COLUMN IF NOT EXISTS surge_multiplier DECIMAL(3,2) DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS final_price_cents INT,
ADD COLUMN IF NOT EXISTS platform_commission_cents INT,
ADD COLUMN IF NOT EXISTS provider_commission_cents INT;

-- Demand Analytics Table (For ML Surge/Pricing)
CREATE TABLE IF NOT EXISTS public.demand_analytics (
  id BIGSERIAL PRIMARY KEY,
  snapshot_date DATE NOT NULL,
  snapshot_time TIME,
  service_type VARCHAR(50),
  location_grid_id VARCHAR(10),
  city_id UUID REFERENCES public.locations(id),
  pincode VARCHAR(6),
  
  -- Metrics
  historical_order_count DECIMAL(10,2),
  time_of_day VARCHAR(10),
  day_of_week INT, -- 0-6
  is_holiday BOOLEAN DEFAULT false,
  month INT,
  
  -- Derived
  demand_multiplier DECIMAL(4,2),
  provider_capacity_used DECIMAL(3,2),
  predicted_surge_level VARCHAR(20),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_demand_date ON public.demand_analytics(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_demand_service ON public.demand_analytics(service_type);
CREATE INDEX IF NOT EXISTS idx_demand_grid ON public.demand_analytics(location_grid_id);

-- Churn Risk Scoring
CREATE TABLE IF NOT EXISTS public.churn_risk_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  total_risk_score DECIMAL(3,2), -- 0.0-1.0
  
  -- Factors
  days_since_last_booking INT,
  acceptance_rate_declined DECIMAL(3,2),
  rating_declined BOOLEAN,
  low_earnings_flag BOOLEAN,
  competitor_app_signals DECIMAL(3,2),
  support_tickets_count INT,
  
  -- Interventions
  intervention_type VARCHAR(100),
  intervention_offered_at TIMESTAMP WITH TIME ZONE,
  intervention_accepted BOOLEAN,
  
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  next_calculation_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(provider_id)
);

-- RLS Policies for new tables
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pincodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demand_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.churn_risk_scores ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Public View for locations/services, Admin for analytics)
DO $$ BEGIN
    CREATE POLICY "locations_public_select" ON public.locations FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "pincodes_public_select" ON public.pincodes FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "services_public_select" ON public.services FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Functions & Triggers for updated_at
CREATE OR REPLACE FUNCTION get_location_from_coords(p_lat DECIMAL, p_lng DECIMAL)
RETURNS UUID AS $$
    SELECT id FROM public.locations
    WHERE hierarchy_level IN ('L4_ZONE', 'L3_CITY')
    AND ST_Intersects(polygon, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography)
    ORDER BY hierarchy_level DESC -- Zone matches first, then City
    LIMIT 1;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ BEGIN
  CREATE TRIGGER tr_locations_updated_at BEFORE UPDATE ON public.locations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TRIGGER tr_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Grant Permissions
GRANT SELECT ON public.locations TO authenticated, anon;
GRANT SELECT ON public.pincodes TO authenticated, anon;
GRANT SELECT ON public.services TO authenticated, anon;
GRANT ALL ON public.demand_analytics TO service_role;
GRANT ALL ON public.churn_risk_scores TO service_role;
