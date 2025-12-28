
-- Fix Service Categories to use Slugs instead of UUIDs
-- This ensures they match the 'services' table references and Frontend URLs

-- 1. Clean up potential old data
DELETE FROM public.live_booking_requests;
DELETE FROM public.bookings;
DELETE FROM public.provider_approval_history;
DELETE FROM public.provider_documents;
DELETE FROM public.services;
DELETE FROM public.service_categories;

-- 2. Modify Schema to support Slug IDs

-- Dynamic dropping of constraints to avoid errors if they don't exist
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    -- Drop constraints on services
    FOR r IN (SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'services' AND constraint_type = 'FOREIGN KEY') LOOP
        EXECUTE 'ALTER TABLE public.services DROP CONSTRAINT ' || quote_ident(r.constraint_name);
    END LOOP;

    -- Drop constraints on providers
    FOR r IN (SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'providers' AND constraint_type = 'FOREIGN KEY') LOOP
        EXECUTE 'ALTER TABLE public.providers DROP CONSTRAINT ' || quote_ident(r.constraint_name);
    END LOOP;

    -- Drop constraints on bookings
    FOR r IN (SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'bookings' AND constraint_type = 'FOREIGN KEY') LOOP
        EXECUTE 'ALTER TABLE public.bookings DROP CONSTRAINT ' || quote_ident(r.constraint_name);
    END LOOP;

    -- Drop constraints on live_booking_requests
    FOR r IN (SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'live_booking_requests' AND constraint_type = 'FOREIGN KEY') LOOP
        EXECUTE 'ALTER TABLE public.live_booking_requests DROP CONSTRAINT ' || quote_ident(r.constraint_name);
    END LOOP;
    
    -- Drop constraints on service_availability (if exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_availability') THEN
        FOR r IN (SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'service_availability' AND constraint_type = 'FOREIGN KEY') LOOP
            EXECUTE 'ALTER TABLE public.service_availability DROP CONSTRAINT ' || quote_ident(r.constraint_name);
        END LOOP;
    END IF;
END $$;

-- Change ID type to TEXT
ALTER TABLE public.service_categories ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.service_categories ALTER COLUMN id TYPE TEXT USING id::text;

-- Update Services table
ALTER TABLE public.services ALTER COLUMN category TYPE TEXT;
ALTER TABLE public.services ADD CONSTRAINT services_category_fkey FOREIGN KEY (category) REFERENCES public.service_categories(id);

-- Update Providers table (Column is 'category')
ALTER TABLE public.providers ALTER COLUMN category TYPE TEXT USING category::text;
ALTER TABLE public.providers ADD CONSTRAINT providers_category_fkey FOREIGN KEY (category) REFERENCES public.service_categories(id);

-- Update Bookings table (Column is 'service_category')
ALTER TABLE public.bookings ALTER COLUMN service_category TYPE TEXT USING service_category::text;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_service_category_fkey FOREIGN KEY (service_category) REFERENCES public.service_categories(id);

-- Update Live Booking Requests (If it has a link? Usually it links to booking_id, not category directly. But checking just in case)
-- Based on error logs, live_book_requests might NOT have a category link, but let's leave it unless we find one.
-- Earlier error mentioned 'live_booking_requests_service_category_id_fkey' but that might have been inferred or from a previous run.
-- If live_booking_requests relates to category, update here. Assuming NO direct link for now based on consolidated schema.

-- Update Service Availability (If exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_availability' AND column_name = 'service_category_id') THEN
    ALTER TABLE public.service_availability ALTER COLUMN service_category_id TYPE TEXT USING service_category_id::text;
    ALTER TABLE public.service_availability ADD CONSTRAINT service_availability_service_category_id_fkey FOREIGN KEY (service_category_id) REFERENCES public.service_categories(id);
  END IF;
END $$;

-- 2. Insert Categories with explicit Slug IDs
INSERT INTO public.service_categories (id, name, group_name, description, icon_url, image_url, gradient_colors, display_order, is_active, created_at, updated_at)
VALUES
    ('ac-appliances', 'AC & Appliances', 'Home Care & Repair', 'AC repair • RO service • Fridge repair', '❄️', 'https://images.unsplash.com/photo-1621905476059-5f3460b56b3b?q=80&w=600', ARRAY['from-blue-500/80', 'to-cyan-500/80'], 1, true, now(), now()),
    ('rides', 'Rides (Bike & Cab)', 'Transport', 'Bike taxi • Car rental • Airport transfer', '🏍️', 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=600', ARRAY['from-orange-500/80', 'to-red-500/80'], 2, true, now(), now()),
    ('cleaning', 'Home Cleaning', 'Home Care & Repair', 'Deep cleaning • Regular cleaning • Sofa cleaning', '🧹', 'https://images.unsplash.com/photo-1581578731117-10452b7a7028?q=80&w=600', ARRAY['from-green-500/80', 'to-emerald-500/80'], 3, true, now(), now()),
    ('electrician', 'Electrician', 'Home Care & Repair', 'Wiring • Switch repair • Fan installation', '⚡', 'https://images.unsplash.com/photo-1621905476059-5f3460b56b3b?q=80&w=600', ARRAY['from-yellow-500/80', 'to-amber-500/80'], 4, true, now(), now()),
    ('plumbing', 'Plumbing', 'Home Care & Repair', 'Leak repair • Pipe fitting • Bathroom fixtures', '🔧', 'https://images.unsplash.com/photo-1505798577917-a651a5d40318?q=80&w=600', ARRAY['from-blue-600/80', 'to-indigo-600/80'], 5, true, now(), now()),
    ('salon', 'Salon & Grooming', 'Personal Care', 'Haircut • Facial • Massage', '💇', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600', ARRAY['from-pink-500/80', 'to-rose-500/80'], 6, true, now(), now()),
    ('car-wash', 'Car Wash', 'Vehicle Care', 'Exterior • Interior • Full detailing', '🚿', 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=600', ARRAY['from-teal-500/80', 'to-cyan-500/80'], 7, true, now(), now()),
    ('bike-wash', 'Bike Wash', 'Vehicle Care', 'Quick wash • Deep clean • Polish', '💦', 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=600', ARRAY['from-purple-500/80', 'to-pink-500/80'], 8, true, now(), now()),
    ('yoga', 'Yoga & Fitness', 'Health & Wellness', 'Yoga session • Personal training • Meditation', '🧘', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600', ARRAY['from-slate-500/80', 'to-gray-500/80'], 9, true, now(), now());

-- 3. Re-seed Services (matches 20250122000001_seed_services.sql content but explicitly here for atomicity)
INSERT INTO public.services (code, name, category, description, base_price_cents, duration_minutes_min, is_active, created_at, updated_at)
VALUES
    ('ac-repair', 'AC Repair & Service', 'ac-appliances', 'Complete AC repair, gas refilling, and maintenance services', 50000, 60, true, now(), now()),
    ('ac-installation', 'AC Installation', 'ac-appliances', 'Professional AC installation with warranty', 80000, 120, true, now(), now()),
    ('bathroom-fitting', 'Bathroom Fitting', 'plumbing', 'Complete bathroom fitting and fixture installation', 150000, 180, true, now(), now()),
    ('haircut-home', 'Haircut at Home', 'salon', 'Professional haircut service at your doorstep', 30000, 45, true, now(), now());
