-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Providers Table (Extends auth.users)
create table public.providers (
  id uuid references auth.users not null primary key,
  full_name text,
  avatar_url text,
  category text,
  description text,
  price_per_hour numeric,
  experience_years integer,
  is_verified boolean default false,
  is_online boolean default false,
  location geography(POINT),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Providers
alter table public.providers enable row level security;

create policy "Public profiles are viewable by everyone."
  on public.providers for select
  using ( true );

create policy "Users can insert their own profile."
  on public.providers for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on public.providers for update
  using ( auth.uid() = id );

-- Bookings Table (Enhanced)
create table public.bookings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  worker_id uuid references public.providers(id) not null,
  service_id text, -- ID from the new service types
  status text check (status in ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')) default 'pending',
  total_price numeric,
  payment_status text check (payment_status in ('paid', 'unpaid')) default 'unpaid',
  checklist text[], -- Array of task items
  estimated_cost numeric,
  requirements jsonb,
  date timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Bookings
alter table public.bookings enable row level security;

create policy "Users can view their own bookings."
  on public.bookings for select
  using ( auth.uid() = user_id );

create policy "Providers can view their assigned bookings."
  on public.bookings for select
  using ( auth.uid() = worker_id );

create policy "Users can create bookings."
  on public.bookings for insert
  with check ( auth.uid() = user_id );

create policy "Providers can update their assigned bookings."
  on public.bookings for update
  using ( auth.uid() = worker_id );

-- Reviews Table
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  booking_id uuid references public.bookings(id) not null,
  user_id uuid references auth.users not null,
  worker_id uuid references public.providers(id) not null,
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Reviews
alter table public.reviews enable row level security;

create policy "Reviews are viewable by everyone."
  on public.reviews for select
  using ( true );

create policy "Users can create reviews for their bookings."
  on public.reviews for insert
  with check ( auth.uid() = user_id );
