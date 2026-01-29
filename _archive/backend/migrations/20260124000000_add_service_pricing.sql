-- Create service_pricing table for managing base prices separately
-- Migration: 20260124000000_add_service_pricing.sql

BEGIN;

-- Create service_pricing table
CREATE TABLE IF NOT EXISTS service_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_category_id UUID REFERENCES service_categories(id) ON DELETE CASCADE,
  base_price NUMERIC(10, 2) NOT NULL DEFAULT 499.00,
  currency CHAR(3) DEFAULT 'INR',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(service_category_id)
);

-- Enable RLS
ALTER TABLE service_pricing ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can view active pricing"
  ON service_pricing FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage pricing"
  ON service_pricing FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_service_pricing_category ON service_pricing(service_category_id);

-- Trigger for updated_at
CREATE TRIGGER update_service_pricing_updated_at
    BEFORE UPDATE ON service_pricing
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Seed data for existing services (default assumption)
INSERT INTO service_pricing (service_category_id, base_price)
SELECT id, 499.00
FROM service_categories
ON CONFLICT (service_category_id) DO NOTHING;

COMMIT;
