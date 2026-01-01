-- Add registration tracking columns to providers table
ALTER TABLE public.providers 
ADD COLUMN IF NOT EXISTS registration_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS phone_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS business_name text,
ADD COLUMN IF NOT EXISTS description text;
