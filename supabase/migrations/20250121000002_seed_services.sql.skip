-- Seed services for categories
-- This adds sample services to populate category pages

-- Update existing leak-repair service to have proper category
UPDATE public.services 
SET category_id = 'plumbing', 
    description = 'Expert repair for leaking taps, pipes, and fixtures. Quick response and quality work guaranteed.',
    keywords = ARRAY['leak', 'plumbing', 'tap', 'pipe', 'water'],
    updated_at = now()
WHERE code = 'leak-repair';

-- Insert additional services
INSERT INTO public.services (code, name, category_id, description, base_price_cents, duration_minutes_min, keywords, is_active, created_at, updated_at)
VALUES
    -- AC & Appliances
    ('ac-repair', 'AC Repair & Service', 'ac-appliances', 'Complete AC repair, gas refilling, and maintenance services', 50000, 60, ARRAY['ac', 'cooling', 'not cooling', 'repair'], true, now(), now()),
    ('ac-installation', 'AC Installation', 'ac-appliances', 'Professional AC installation with warranty', 80000, 120, ARRAY['ac', 'install', 'new ac'], true, now(), now()),
    ('fridge-repair', 'Refrigerator Repair', 'ac-appliances', 'Fridge not cooling, ice formation, and other issues', 45000, 60, ARRAY['fridge', 'refrigerator', 'not cooling'], true, now(), now()),
    
    -- Rides
    ('bike-taxi', 'Bike Taxi', 'rides', 'Quick and affordable bike taxi service', 5000, 30, ARRAY['bike', 'taxi', 'cab', 'ride'], true, now(), now()),
    ('car-rental', 'Car Rental', 'rides', 'Self-drive and chauffeur-driven car rentals', 100000, 480, ARRAY['car', 'rental', 'self drive'], true, now(), now()),
    
    -- Cleaning
    ('deep-cleaning', 'Deep Home Cleaning', 'cleaning', 'Complete home deep cleaning with professional equipment', 200000, 240, ARRAY['cleaning', 'deep clean', 'home'], true, now(), now()),
    ('sofa-cleaning', 'Sofa Cleaning', 'cleaning', 'Professional sofa and upholstery cleaning', 80000, 90, ARRAY['sofa', 'cleaning', 'upholstery'], true, now(), now()),
    
    -- Electrician
    ('wiring-repair', 'Electrical Wiring', 'electrician', 'Complete wiring solutions and repairs', 60000, 120, ARRAY['wiring', 'electrical', 'electrician'], true, now(), now()),
    ('fan-installation', 'Fan Installation', 'electrician', 'Ceiling fan installation and repair', 30000, 45, ARRAY['fan', 'install', 'ceiling fan'], true, now(), now()),
    
    -- Plumbing (in addition to leak-repair)
    ('bathroom-fitting', 'Bathroom Fitting', 'plumbing', 'Complete bathroom fitting and fixture installation', 150000, 180, ARRAY['bathroom', 'fitting', 'plumbing'], true, now(), now()),
    
    -- Salon
    ('haircut-home', 'Haircut at Home', 'salon', 'Professional haircut service at your doorstep', 30000, 45, ARRAY['haircut', 'salon', 'grooming'], true, now(), now()),
    ('facial-home', 'Facial at Home', 'salon', 'Relaxing facial treatment at home', 80000, 60, ARRAY['facial', 'beauty', 'skincare'], true, now(), now()),
    
    -- Car Wash
    ('car-wash-exterior', 'Car Exterior Wash', 'car-wash', 'Complete exterior car wash and cleaning', 40000, 30, ARRAY['car', 'wash', 'cleaning'], true, now(), now()),
    ('car-detailing', 'Full Car Detailing', 'car-wash', 'Complete interior and exterior car detailing', 150000, 180, ARRAY['car', 'detailing', 'polish'], true, now(), now()),
    
    -- Bike Wash
    ('bike-wash-basic', 'Basic Bike Wash', 'bike-wash', 'Quick and thorough bike wash', 20000, 20, ARRAY['bike', 'wash', 'cleaning'], true, now(), now()),
    
    -- Yoga
    ('yoga-session', 'Personal Yoga Session', 'yoga', 'One-on-one yoga training at home', 50000, 60, ARRAY['yoga', 'fitness', 'training'], true, now(), now())
ON CONFLICT (code) DO UPDATE SET
    category_id = EXCLUDED.category_id,
    description = EXCLUDED.description,
    base_price_cents = EXCLUDED.base_price_cents,
    duration_minutes_min = EXCLUDED.duration_minutes_min,
    keywords = EXCLUDED.keywords,
    is_active = EXCLUDED.is_active,
    updated_at = now();
