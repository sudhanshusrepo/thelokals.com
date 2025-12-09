-- Consolidated Migration File
-- Generated: 2025-12-03
-- Contains:
-- 1. Dynamic Pricing Schema
-- 2. Online Services Seed
-- 3. Admin Panel Foundation
-- 4. Booking Lifecycle Phase 1 (Request)
-- 5. Booking Lifecycle Phase 2 (Match)
-- 6. Booking Webhook Trigger

-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- ==========================================
-- 1. Dynamic Pricing Schema
-- ==========================================

-- Base Prices Table
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

-- Timing Multipliers Table
CREATE TABLE IF NOT EXISTS timing_multipliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  time_segment TEXT NOT NULL,
  day_type TEXT NOT NULL,
  multiplier DECIMAL(4,2) NOT NULL,
  start_hour INTEGER NOT NULL,
  end_hour INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(time_segment, day_type)
);

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

-- Location Zones Table
CREATE TABLE IF NOT EXISTS location_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zone_name TEXT NOT NULL,
  city TEXT NOT NULL,
  tier INTEGER NOT NULL,
  geo_boundary GEOGRAPHY(POLYGON, 4326),
  price_multiplier DECIMAL(4,2) DEFAULT 1.0,
  socio_economic_index DECIMAL(4,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(zone_name, city)
);

CREATE INDEX IF NOT EXISTS idx_location_zones_geo ON location_zones USING GIST(geo_boundary);

-- Competitor Prices Table
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

-- Pricing History Table
CREATE TABLE IF NOT EXISTS pricing_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID, -- References bookings(id) added later to avoid circular dep if bookings not created yet
  service_category TEXT NOT NULL,
  service_type TEXT NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  final_price DECIMAL(10,2) NOT NULL,
  multipliers JSONB,
  competitor_avg_price DECIMAL(10,2),
  accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pricing_history_analytics ON pricing_history(service_category, created_at DESC, accepted);

-- ==========================================
-- 2. Online Services Seed
-- ==========================================

-- Ensure service_categories table exists (from core schema, but good to be safe)
CREATE TABLE IF NOT EXISTS service_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  group_name TEXT,
  icon TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO service_categories (name, group_name, icon, description, is_active) VALUES
('DigitalMarketing', 'Digital & Growth', '📈', 'Social media, SEO, marketing automation, and growth strategies.', true),
('ContentCreative', 'Content & Creative', '🎨', 'Writing, design, video editing, and creative production.', true),
('TechDev', 'Tech & Product', '💻', 'Development, UI/UX, QA, AI automation, and data analysis.', true),
('BusinessOps', 'Business & Operations', '💼', 'Virtual assistants, project management, finance, and HR.', true),
('KnowledgeServices', 'Knowledge & Advisory', '🧠', 'Tutoring, coaching, legal, financial, and business advice.', true),
('ProfessionalAdvisory', 'Knowledge & Advisory', '⚖️', 'Legal, financial, and business advice.', true),
('WellnessOnline', 'Wellness & Personal', '🧘', 'Mental health, life coaching, nutrition, and fitness plans.', true),
('CreatorEconomy', 'Creator Economy', '📱', 'UGC, personal branding, and influencer services.', true),
('LocalBizDigitization', 'Local Biz Digitization', '🏪', 'Get your local business online with Google, catalogs, and more.', true)
ON CONFLICT (name) DO UPDATE SET 
    group_name = EXCLUDED.group_name,
    icon = EXCLUDED.icon,
    description = EXCLUDED.description;

INSERT INTO base_prices (service_category, service_type, base_price, currency) VALUES
('DigitalMarketing', 'SEO Optimization', 5000.00, 'INR'),
('DigitalMarketing', 'Social Media Mgmt', 8000.00, 'INR'),
('DigitalMarketing', 'Ad Campaigns', 5000.00, 'INR'),
('ContentCreative', 'Blog Writing', 1000.00, 'INR'),
('ContentCreative', 'Graphic Design', 500.00, 'INR'),
('ContentCreative', 'Video Editing', 1000.00, 'INR'),
('TechDev', 'Website Development', 10000.00, 'INR'),
('TechDev', 'App Development', 50000.00, 'INR'),
('TechDev', 'Automation', 5000.00, 'INR'),
('BusinessOps', 'Virtual Assistant', 500.00, 'INR'),
('BusinessOps', 'Data Entry', 300.00, 'INR'),
('KnowledgeServices', 'Online Tutoring', 500.00, 'INR'),
('KnowledgeServices', 'Career Coaching', 1000.00, 'INR'),
('ProfessionalAdvisory', 'Legal Consultation', 2000.00, 'INR'),
('ProfessionalAdvisory', 'Financial Advice', 1500.00, 'INR'),
('WellnessOnline', 'Online Therapy', 1000.00, 'INR'),
('WellnessOnline', 'Diet/Nutrition Plan', 1500.00, 'INR'),
('CreatorEconomy', 'UGC Creation', 2000.00, 'INR'),
('CreatorEconomy', 'Influencer Collab', 5000.00, 'INR'),
('LocalBizDigitization', 'Google My Business', 2000.00, 'INR'),
('LocalBizDigitization', 'Digital Catalog', 1000.00, 'INR')
ON CONFLICT (service_category, service_type, effective_from) DO NOTHING;

-- ==========================================
-- 3. Admin Panel Foundation
-- ==========================================

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  google_id TEXT UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'ops_admin', 'read_only')),
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_category_id UUID NOT NULL, -- Assuming this links to service_categories.id or name? Schema says UUID, but service_categories uses name as key in some places. Let's assume UUID.
  location_type TEXT NOT NULL CHECK (location_type IN ('city', 'area', 'pincode')),
  location_value TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ENABLED', 'DISABLED')),
  reason TEXT,
  disabled_by UUID REFERENCES admin_users(id),
  disabled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(service_category_id, location_type, location_value)
);

CREATE TABLE IF NOT EXISTS active_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('customer', 'provider')),
  session_state TEXT,
  city TEXT,
  current_booking_id UUID,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES admin_users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  changes JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_service_availability_lookup ON service_availability(service_category_id, location_value);
CREATE INDEX IF NOT EXISTS idx_service_availability_status ON service_availability(status) WHERE status = 'DISABLED';
CREATE INDEX IF NOT EXISTS idx_active_sessions_recent ON active_sessions(last_activity DESC);
CREATE INDEX IF NOT EXISTS idx_active_sessions_user ON active_sessions(user_id, user_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_recent ON admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON admin_audit_logs(admin_id, created_at DESC);

-- RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_users_policy ON admin_users FOR ALL USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));
CREATE POLICY service_availability_read ON service_availability FOR SELECT USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));
CREATE POLICY service_availability_write ON service_availability FOR ALL USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role IN ('super_admin', 'ops_admin')));
CREATE POLICY audit_logs_read ON admin_audit_logs FOR SELECT USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));
CREATE POLICY active_sessions_read ON active_sessions FOR SELECT USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

-- Insert default super admin
INSERT INTO admin_users (email, role, full_name)
VALUES ('admin@thelokals.com', 'super_admin', 'System Administrator')
ON CONFLICT (email) DO NOTHING;

-- ==========================================
-- 4. Booking Lifecycle Phase 1 (Request)
-- ==========================================

-- Ensure bookings table exists (Core schema)
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID, -- References auth.users
  provider_id UUID, -- References providers
  service_category TEXT,
  status TEXT DEFAULT 'REQUESTED',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Extend bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_mode TEXT CHECK (service_mode IN ('local', 'online'));
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS input_method TEXT CHECK (input_method IN ('voice', 'text', 'form'));
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS voice_transcript TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS estimated_price_min DECIMAL(10,2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS estimated_price_max DECIMAL(10,2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS estimated_duration_min INTEGER;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS estimated_duration_max INTEGER;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS preferred_time TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS urgency TEXT CHECK (urgency IN ('low', 'normal', 'high', 'emergency'));
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS ai_classification JSONB;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pricing_breakdown JSONB;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS location GEOGRAPHY(POINT, 4326); -- Ensure location column exists
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS address JSONB; -- Ensure address column exists

-- Booking Lifecycle Events
CREATE TABLE IF NOT EXISTS booking_lifecycle_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  phase TEXT NOT NULL CHECK (phase IN ('REQUEST', 'MATCH', 'CONFIRM', 'EXECUTE', 'COMPLETE', 'REVIEW')),
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service Pricing (Reduced Rates)
CREATE TABLE IF NOT EXISTS service_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_category TEXT NOT NULL UNIQUE,
  service_mode TEXT NOT NULL CHECK (service_mode IN ('local', 'online')),
  base_price DECIMAL(10,2) NOT NULL,
  price_unit TEXT DEFAULT 'per_service',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO service_pricing (service_category, service_mode, base_price, price_unit) VALUES
('cleaning', 'local', 200, 'per_service'),
('plumbing', 'local', 250, 'per_service'),
('electrician', 'local', 250, 'per_service'),
('carpenter', 'local', 300, 'per_service'),
('painting', 'local', 350, 'per_service'),
('appliance_repair', 'local', 200, 'per_service'),
('pest_control', 'local', 400, 'per_service'),
('home_cleaning', 'local', 250, 'per_service'),
('tax_consulting', 'online', 300, 'per_hour'),
('web_development', 'online', 400, 'per_hour'),
('graphic_design', 'online', 350, 'per_hour'),
('content_writing', 'online', 200, 'per_hour'),
('digital_marketing', 'online', 450, 'per_hour'),
('tutoring', 'online', 250, 'per_hour'),
('legal_consulting', 'online', 500, 'per_hour'),
('accounting', 'online', 350, 'per_hour')
ON CONFLICT (service_category) DO UPDATE SET
  base_price = EXCLUDED.base_price,
  updated_at = NOW();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bookings_service_mode ON bookings(service_mode);
CREATE INDEX IF NOT EXISTS idx_bookings_status_created ON bookings(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_urgency ON bookings(urgency) WHERE urgency IN ('high', 'emergency');
CREATE INDEX IF NOT EXISTS idx_lifecycle_events_booking ON booking_lifecycle_events(booking_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lifecycle_events_phase ON booking_lifecycle_events(phase, created_at DESC);

-- Auto-log trigger
CREATE OR REPLACE FUNCTION log_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    INSERT INTO booking_lifecycle_events (booking_id, phase, event_type, event_data)
    VALUES (
      NEW.id,
      CASE 
        WHEN NEW.status = 'REQUESTED' THEN 'REQUEST'
        WHEN NEW.status IN ('PENDING', 'CONFIRMED') THEN 'MATCH'
        WHEN NEW.status = 'IN_PROGRESS' THEN 'EXECUTE'
        WHEN NEW.status = 'COMPLETED' THEN 'COMPLETE'
        ELSE 'REQUEST'
      END,
      'status_changed',
      jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS booking_status_change_trigger ON bookings;
CREATE TRIGGER booking_status_change_trigger
  AFTER UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION log_booking_status_change();

-- ==========================================
-- 5. Booking Lifecycle Phase 2 (Match)
-- ==========================================

-- Ensure providers table exists
CREATE TABLE IF NOT EXISTS providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users,
  is_active BOOLEAN DEFAULT TRUE,
  services TEXT[], -- Array of service categories
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS booking_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED')) DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(booking_id, provider_id)
);

CREATE INDEX IF NOT EXISTS idx_booking_requests_provider_status ON booking_requests(provider_id, status);
CREATE INDEX IF NOT EXISTS idx_booking_requests_booking ON booking_requests(booking_id);

-- Accept Booking Function
CREATE OR REPLACE FUNCTION accept_booking(
  p_booking_id UUID,
  p_provider_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_booking_status TEXT;
  v_request_status TEXT;
BEGIN
  SELECT status INTO v_booking_status FROM bookings WHERE id = p_booking_id FOR UPDATE;
  
  IF v_booking_status NOT IN ('REQUESTED', 'PENDING') THEN
    RETURN jsonb_build_object('success', false, 'message', 'Booking already taken or cancelled');
  END IF;

  SELECT status INTO v_request_status FROM booking_requests 
  WHERE booking_id = p_booking_id AND provider_id = p_provider_id;

  IF v_request_status != 'PENDING' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Request is no longer valid');
  END IF;

  UPDATE bookings 
  SET 
    status = 'CONFIRMED', 
    provider_id = p_provider_id,
    updated_at = NOW()
  WHERE id = p_booking_id;

  UPDATE booking_requests 
  SET status = 'ACCEPTED', updated_at = NOW()
  WHERE booking_id = p_booking_id AND provider_id = p_provider_id;

  UPDATE booking_requests 
  SET status = 'EXPIRED', updated_at = NOW()
  WHERE booking_id = p_booking_id AND provider_id != p_provider_id;

  RETURN jsonb_build_object('success', true, 'message', 'Booking accepted successfully');
END;
$$ LANGUAGE plpgsql;

ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY providers_view_own_requests ON booking_requests
  FOR SELECT USING (auth.uid() IN (SELECT user_id FROM providers WHERE id = provider_id));

CREATE POLICY providers_update_own_requests ON booking_requests
  FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM providers WHERE id = provider_id));

-- ==========================================
-- 6. Booking Webhook Trigger
-- ==========================================

-- Template for webhook trigger (Requires replacement of placeholders)
-- CREATE TRIGGER on_booking_created
--   AFTER INSERT ON bookings
--   FOR EACH ROW
--   EXECUTE FUNCTION supabase_functions.http_request(
--     'https://<PROJECT_REF>.supabase.co/functions/v1/process-booking',
--     'POST',
--     '{"Content-Type":"application/json", "Authorization":"Bearer <SERVICE_ROLE_KEY>"}'
--   );
