-- ============================================
-- THELOKALS MVP SEED DATA
-- Version: 1.0 (Bible 3.1 Aligned)
-- Description: Seeds the 6 Core MVP Services and Initial Locations (Gurugram)
-- ============================================

-- 1. Seed Locations (Gurugram - MVP Launch City)
INSERT INTO public.locations (hierarchy_level, name, center_lat, center_lng, population)
VALUES 
('L3_CITY', 'Gurugram', 28.4595, 77.0266, 2500000),
('L3_CITY', 'Bhopal', 23.2599, 77.4126, 2000000)
ON CONFLICT (hierarchy_level, name, parent_id) DO NOTHING;

-- 2. Seed Services (Home Maintenance - Category 1)
INSERT INTO public.services (code, name, description, category, base_price_cents, duration_minutes_min, duration_minutes_max, enabled_globally, required_documents)
VALUES
('plumbing', 'Plumbing Service', 'Leakage, Pipe Fitting, and general plumbing repairs', 'home_maintenance', 35000, 30, 60, true, '["digilocker_aadhaar"]'),
('electrical', 'Electrical Service', 'Fault repair, Installation, Wiring', 'home_maintenance', 40000, 45, 90, true, '["digilocker_aadhaar"]'),
('ac_repair', 'AC Repair & Service', 'Gas filling, Leak repair, Dry/Wet Service', 'home_maintenance', 50000, 60, 120, true, '["digilocker_aadhaar", "certification"]');

-- 3. Seed Services (Vehicle Services - Category 2)
INSERT INTO public.services (code, name, description, category, base_price_cents, duration_minutes_min, duration_minutes_max, enabled_globally, required_documents)
VALUES
('cab_rental', 'Cab Rental (Hourly)', 'Chauffeur driven cab for local usage', 'vehicle', 25000, 60, 480, true, '["digilocker_driving_license", "rc_book"]'),
('bike_rental', 'Bike Rental (Hourly)', 'Self-drive bike rental', 'vehicle', 15000, 60, 480, true, '["digilocker_driving_license"]');

-- 4. Seed Services (Personal Services - Category 3)
INSERT INTO public.services (code, name, description, category, base_price_cents, duration_minutes_min, duration_minutes_max, enabled_globally, required_documents)
VALUES
('tutoring', 'Coding Mentoring', '1:1 Session for basic programming mentoring', 'personal', 40000, 60, 60, true, '["digilocker_aadhaar"]');

-- 5. Enable Services in Gurugram
-- (Assuming we fetch the UUIDs dynamically or they are stable. For seed, we might use DO block or simple global enable)
UPDATE public.services SET enabled_cities = '["Gurugram", "Bhopal"]'::jsonb;
