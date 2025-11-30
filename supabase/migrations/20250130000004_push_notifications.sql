-- Add push_token to providers
ALTER TABLE public.providers ADD COLUMN IF NOT EXISTS push_token text;

-- Add push_token to profiles (for users)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS push_token text;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_providers_push_token ON public.providers(push_token);
CREATE INDEX IF NOT EXISTS idx_profiles_push_token ON public.profiles(push_token);
