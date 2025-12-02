-- 05_seeds.sql
-- Seed Data: Service Categories, Base Prices, Location Zones, Admin User

-- 1. Service Categories
INSERT INTO public.service_categories (name, group_name, icon, description) VALUES
  ('Plumber', 'Home Care & Repair', '🔧', 'Fix maintain and improve your home with trusted professionals.'),
  ('Electrician', 'Home Care & Repair', '⚡', 'Fix maintain and improve your home with trusted professionals.'),
  ('Carpenter', 'Home Care & Repair', '🔨', 'Fix maintain and improve your home with trusted professionals.'),
  ('Painter', 'Home Care & Repair', '🎨', 'Fix maintain and improve your home with trusted professionals.'),
  ('Appliance Repair', 'Home Care & Repair', '🔧', 'Fix maintain and improve your home with trusted professionals.'),
  ('Locksmith', 'Home Care & Repair', '🔑', 'Fix maintain and improve your home with trusted professionals.'),
  ('Pest Control', 'Home Care & Repair', '🐛', 'Fix maintain and improve your home with trusted professionals.'),
  ('Gardener', 'Home Care & Repair', '🌱', 'Fix maintain and improve your home with trusted professionals.'),
  
  ('Maid Service', 'Cleaning & Logistics', '🧹', 'Keep your space spotless and manage moves with ease.'),
  ('House Cleaning', 'Cleaning & Logistics', '🏠', 'Keep your space spotless and manage moves with ease.'),
  ('Laundry Service', 'Cleaning & Logistics', '🧺', 'Keep your space spotless and manage moves with ease.'),
  ('Packers & Movers', 'Cleaning & Logistics', '📦', 'Keep your space spotless and manage moves with ease.'),
  ('Car Washing', 'Cleaning & Logistics', '🚗', 'Keep your space spotless and manage moves with ease.'),
  
  ('Mechanic', 'Auto & Transportation', '🔧', 'Keep your vehicles running smoothly and get where you need to go.'),
  ('Driver', 'Auto & Transportation', '🚗', 'Keep your vehicles running smoothly and get where you need to go.'),
  ('Bike Repair', 'Auto & Transportation', '🚲', 'Keep your vehicles running smoothly and get where you need to go.'),
  ('Roadside Assistance', 'Auto & Transportation', '🛠️', 'Keep your vehicles running smoothly and get where you need to go.')
ON CONFLICT (name) DO NOTHING;

-- 2. Base Prices (Local Services)
INSERT INTO public.base_prices (service_category, service_type, base_price, price_unit) VALUES
  ('Plumber', 'pipe_repair', 250, 'per_service'),
  ('Plumber', 'leak_fixing', 200, 'per_service'),
  ('Plumber', 'installation', 350, 'per_service'),
  ('Electrician', 'wiring', 300, 'per_service'),
  ('Electrician', 'appliance_installation', 200, 'per_service'),
  ('Electrician', 'repair', 250, 'per_service'),
  ('Carpenter', 'furniture_repair', 300, 'per_service'),
  ('Carpenter', 'custom_work', 500, 'per_service'),
  ('Painter', 'interior', 350, 'per_room'),
  ('Painter', 'exterior', 450, 'per_room'),
  ('House Cleaning', 'deep_clean', 400, 'per_service'),
  ('House Cleaning', 'regular_clean', 250, 'per_service'),
  ('Pest Control', 'general', 400, 'per_service'),
  ('Pest Control', 'termite', 600, 'per_service')
ON CONFLICT (service_category, service_type, effective_from) DO NOTHING;

-- 3. Timing Multipliers
INSERT INTO public.timing_multipliers (time_category, day_of_week, hour_start, hour_end, multiplier) VALUES
  ('weekday_morning', 1, 6, 9, 1.0),
  ('weekday_day', 1, 9, 17, 1.0),
  ('weekday_evening', 1, 17, 21, 1.2),
  ('weekday_night', 1, 21, 23, 1.5),
  ('weekend_day', 0, 9, 21, 1.3),
  ('weekend_night', 0, 21, 23, 1.6),
  ('emergency', NULL, NULL, NULL, 2.0)
ON CONFLICT DO NOTHING;

-- 4. Location Zones (Sample Data for San Francisco)
INSERT INTO public.location_zones (zone_name, city, tier, price_multiplier, socio_economic_index) VALUES
  ('Downtown', 'San Francisco', 1, 1.5, 8.5),
  ('Mission District', 'San Francisco', 2, 1.2, 6.5),
  ('Sunset District', 'San Francisco', 3, 1.0, 5.5),
  ('Richmond District', 'San Francisco', 3, 1.0, 5.8)
ON CONFLICT (zone_name, city) DO NOTHING;

-- 5. Default Admin User
INSERT INTO public.admin_users (email, role, full_name) VALUES
  ('admin@thelokals.com', 'SUPER_ADMIN', 'System Administrator')
ON CONFLICT (email) DO NOTHING;

-- 6. Refresh Materialized View
SELECT refresh_booking_analytics();
