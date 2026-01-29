-- Migration: 20260107000001_create_config_and_banners.sql
-- Purpose: Create tables for System Configuration (Feature Flags) and Marketing Banners

BEGIN;

-- 1. System Configs (Feature Flags & Settings)
CREATE TABLE IF NOT EXISTS system_configs (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general', -- 'feature_flag', 'system', 'app'
  is_public BOOLEAN DEFAULT FALSE, -- If true, accessible by anon/public
  updated_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for system_configs
ALTER TABLE system_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage system_configs"
  ON system_configs FOR ALL
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

CREATE POLICY "Public can view public system_configs"
  ON system_configs FOR SELECT
  USING (is_public = true);

-- 2. Marketing Banners
CREATE TABLE IF NOT EXISTS marketing_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT,
  cta_text TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  position INTEGER DEFAULT 0,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for marketing_banners
ALTER TABLE marketing_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage marketing_banners"
  ON marketing_banners FOR ALL
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

CREATE POLICY "Public can view active marketing_banners"
  ON marketing_banners FOR SELECT
  USING (is_active = true);

-- Seed initial feature flags
INSERT INTO system_configs (key, value, description, category, is_public) VALUES
('feature_gurugram_launch', 'true'::jsonb, 'Enable services in Gurugram area', 'feature_flag', true),
('app_maintenance_mode', 'false'::jsonb, 'Global Maintenance Mode', 'system', true),
('provider_signup_enabled', 'true'::jsonb, 'Allow new provider registrations', 'system', true)
ON CONFLICT (key) DO NOTHING;

COMMIT;
