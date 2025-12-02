-- Seed Pricing Data
-- Run this after running the migration 20251201000001_dynamic_pricing_schema.sql

-- 1. Seed Location Zones
-- Creating a zone around San Francisco (where the seed workers are located)
INSERT INTO location_zones (zone_name, city, tier, geo_boundary, price_multiplier, socio_economic_index)
VALUES (
  'Downtown San Francisco',
  'San Francisco',
  1,
  ST_GeomFromText('POLYGON((-122.45 37.75, -122.38 37.75, -122.38 37.81, -122.45 37.81, -122.45 37.75))', 4326)::geography,
  1.2,
  1.5
) ON CONFLICT (zone_name, city) DO NOTHING;

-- 2. Seed Base Prices
-- Service Categories matching seed-workers.sql
INSERT INTO base_prices (service_category, service_type, base_price, currency) VALUES
-- Plumber
('Plumber', 'Standard Visit', 500.00, 'INR'),
('Plumber', 'Emergency', 1000.00, 'INR'),
('Plumber', 'Installation', 1500.00, 'INR'),

-- Electrician
('Electrician', 'Standard Visit', 400.00, 'INR'),
('Electrician', 'Emergency', 900.00, 'INR'),
('Electrician', 'Wiring', 2000.00, 'INR'),

-- Carpenter
('Carpenter', 'Standard Visit', 450.00, 'INR'),
('Carpenter', 'Repair', 800.00, 'INR'),
('Carpenter', 'Custom Work', 2500.00, 'INR'),

-- Maid Service
('Maid Service', 'Standard Cleaning', 300.00, 'INR'),
('Maid Service', 'Deep Cleaning', 800.00, 'INR'),
('Maid Service', 'Move-in/Move-out', 1500.00, 'INR'),

-- Mechanic
('Mechanic', 'Standard Checkup', 600.00, 'INR'),
('Mechanic', 'Emergency Breakdown', 1200.00, 'INR'),
('Mechanic', 'Full Service', 3000.00, 'INR')

ON CONFLICT (service_category, service_type, effective_from) DO NOTHING;
