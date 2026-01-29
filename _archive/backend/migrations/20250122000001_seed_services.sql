-- Seed services for categories
-- This adds sample services to populate category pages

-- Update existing leak-repair service to have proper category
-- Note: 'leak-repair' might not exist if previous seeds were skipped, so this acts as update-if-exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM public.services WHERE code = 'leak-repair') THEN
    UPDATE public.services 
    SET category_id = 'plumbing', 
        description = 'Expert repair for leaking taps, pipes, and fixtures. Quick response and quality work guaranteed.',
        keywords = ARRAY['leak', 'plumbing', 'tap', 'pipe', 'water'],
        updated_at = now()
    WHERE code = 'leak-repair';
  END IF;
END $$;

-- Insert additional services
INSERT INTO public.services (code, name, category, description, base_price_cents, duration_minutes_min, is_active, created_at, updated_at)
VALUES
    -- AC & Appliances
    ('ac-repair', 'AC Repair & Service', 'ac-appliances', 'Complete AC repair, gas refilling, and maintenance services', 50000, 60, true, now(), now()),
    ('ac-installation', 'AC Installation', 'ac-appliances', 'Professional AC installation with warranty', 80000, 120, true, now(), now()),
    ('fridge-repair', 'Refrigerator Repair', 'ac-appliances', 'Fridge not cooling, ice formation, and other issues', 45000, 60, true, now(), now()),
    
    -- Rides
    ('bike-taxi', 'Bike Taxi', 'rides', 'Quick and affordable bike taxi service', 5000, 30, true, now(), now()),
    ('car-rental', 'Car Rental', 'rides', 'Self-drive and chauffeur-driven car rentals', 100000, 480, true, now(), now()),
    
    -- Cleaning
    ('deep-cleaning', 'Deep Home Cleaning', 'cleaning', 'Complete home deep cleaning with professional equipment', 200000, 240, true, now(), now()),
    ('sofa-cleaning', 'Sofa Cleaning', 'cleaning', 'Professional sofa and upholstery cleaning', 80000, 90, true, now(), now()),
    
    -- Electrician
    ('wiring-repair', 'Electrical Wiring', 'electrician', 'Complete wiring solutions and repairs', 60000, 120, true, now(), now()),
    ('fan-installation', 'Fan Installation', 'electrician', 'Ceiling fan installation and repair', 30000, 45, true, now(), now()),
    
    -- Plumbing (in addition to leak-repair)
    ('bathroom-fitting', 'Bathroom Fitting', 'plumbing', 'Complete bathroom fitting and fixture installation', 150000, 180, true, now(), now()),
    
    -- Salon
    ('haircut-home', 'Haircut at Home', 'salon', 'Professional haircut service at your doorstep', 30000, 45, true, now(), now()),
    ('facial-home', 'Facial at Home', 'salon', 'Relaxing facial treatment at home', 80000, 60, true, now(), now()),
    
    -- Car Wash
    ('car-wash-exterior', 'Car Exterior Wash', 'car-wash', 'Complete exterior car wash and cleaning', 40000, 30, true, now(), now()),
    ('car-detailing', 'Full Car Detailing', 'car-wash', 'Complete interior and exterior car detailing', 150000, 180, true, now(), now()),
    
    -- Bike Wash
    ('bike-wash-basic', 'Basic Bike Wash', 'bike-wash', 'Quick and thorough bike wash', 20000, 20, true, now(), now()),
    
    -- Yoga
    ('yoga-session', 'Personal Yoga Session', 'yoga', 'One-on-one yoga training at home', 50000, 60, true, now(), now())
ON CONFLICT (code) DO UPDATE SET
    category = EXCLUDED.category, -- Note: Column name is 'category' in CREATE TABLE, but 'category_id' was in old seed. Schema has 'category' (VARCHAR).
    description = EXCLUDED.description,
    base_price_cents = EXCLUDED.base_price_cents,
    duration_minutes_min = EXCLUDED.duration_minutes_min,
    is_active = EXCLUDED.is_active,
    updated_at = now();
