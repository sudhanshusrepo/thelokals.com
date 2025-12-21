CREATE TABLE IF NOT EXISTS public.services (
    code text PRIMARY KEY,
    name text NOT NULL,
    description text,
    base_price_cents integer,
    duration_minutes_min integer
);

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'bookings_service_code_fkey') THEN 
        ALTER TABLE public.bookings ADD CONSTRAINT bookings_service_code_fkey FOREIGN KEY (service_code) REFERENCES public.services(code); 
    END IF; 
END $$;
