
-- Enable Realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE profiles, workers, bookings, reviews;

-- Custom Types (Enums)
CREATE TYPE public.user_role AS ENUM (
    'CLIENT',
    'WORKER'
);

CREATE TYPE public.worker_category AS ENUM (
    'Cleaning',
    'Plumbing',
    'Electrical',
    'Handyman',
    'Painting',
    'Gardening',
    'Moving',
    'Assembly',
    'Tutoring',
    'PetCare',
    'Landscaping',
    'HVAC',
    'PestControl',
    'Security',
    'TechSupport',
    'Catering',
    'Beauty',
    'Fitness',
    'Photography',
    'Videography'
);

CREATE TYPE public.worker_status AS ENUM (
    'AVAILABLE',
    'BUSY',
    'OFFLINE'
);

CREATE TYPE public.booking_status AS ENUM (
    'PENDING',
    'CONFIRMED',
    'COMPLETED',
    'CANCELLED'
);

-- Tables

-- Profiles Table
CREATE TABLE public.profiles (
    id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    updated_at timestamp with time zone,
    full_name character varying,
    avatar_url character varying,
    role user_role NOT NULL DEFAULT 'CLIENT'::user_role,
    phone_number character varying,
    PRIMARY KEY (id)
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Workers Table
CREATE TABLE public.workers (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    profile_id uuid NOT NULL REFERENCES public.profiles ON DELETE CASCADE,
    name character varying NOT NULL,
    description text,
    category worker_category NOT NULL,
    expertise text[],
    rating numeric(2, 1) DEFAULT 0.0,
    price_per_hour numeric(10, 2),
    status worker_status DEFAULT 'OFFLINE'::worker_status,
    location_lat double precision,
    location_lng double precision,
    created_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id)
);

ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;

-- Bookings Table
CREATE TABLE public.bookings (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles ON DELETE CASCADE,
    worker_id uuid NOT NULL REFERENCES public.workers ON DELETE CASCADE,
    booking_time timestamp with time zone NOT NULL,
    duration_hours integer NOT NULL,
    total_cost numeric(10, 2) NOT NULL,
    status booking_status NOT NULL DEFAULT 'PENDING'::booking_status,
    created_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id)
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Reviews Table
CREATE TABLE public.reviews (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    booking_id uuid NOT NULL REFERENCES public.bookings ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles ON DELETE CASCADE,
    worker_id uuid NOT NULL REFERENCES public.workers ON DELETE CASCADE,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text,
    created_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id),
    UNIQUE (booking_id) -- A user can only review a booking once
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Functions for Triggers & RPC

-- Function to create a profile for a new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update a worker's average rating
CREATE OR REPLACE FUNCTION public.update_worker_rating()
RETURNS TRIGGER AS $$
DECLARE
    new_avg_rating numeric;
BEGIN
    SELECT AVG(rating) INTO new_avg_rating FROM public.reviews WHERE worker_id = new.worker_id;
    UPDATE public.workers SET rating = new_avg_rating WHERE id = new.worker_id;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Triggers

-- Trigger to create a profile on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger to update worker rating after a new review
CREATE TRIGGER on_review_inserted
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE PROCEDURE public.update_worker_rating();


-- Row Level Security (RLS) Policies

-- Profiles RLS
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Workers RLS
CREATE POLICY "Worker profiles are viewable by everyone." ON public.workers
  FOR SELECT USING (true);
  
CREATE POLICY "Workers can create their own worker profile." ON public.workers
  FOR INSERT WITH CHECK (auth.uid() = profile_id AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'WORKER');
  
CREATE POLICY "Workers can update their own worker profile." ON public.workers
  FOR UPDATE USING (auth.uid() = profile_id);

-- Bookings RLS
CREATE POLICY "Users can view their own bookings." ON public.bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Workers can view bookings assigned to them." ON public.bookings
  FOR SELECT USING (auth.uid() = (SELECT profile_id FROM workers WHERE id = worker_id));

CREATE POLICY "Users can create their own bookings." ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can cancel their pending bookings." ON public.bookings
  FOR UPDATE USING (auth.uid() = user_id AND status = 'PENDING');

CREATE POLICY "Workers can update the status of their bookings." ON public.bookings
  FOR UPDATE USING (auth.uid() = (SELECT profile_id FROM workers WHERE id = worker_id));

-- Reviews RLS
CREATE POLICY "Reviews are public and viewable by everyone." ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can only write reviews for their completed bookings." ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id AND (SELECT status FROM bookings WHERE id = booking_id) = 'COMPLETED');
