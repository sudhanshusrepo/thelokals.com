-- Add registration_status column to profiles table
-- This column tracks provider registration workflow status

-- Add column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS registration_status TEXT 
DEFAULT 'unregistered' 
CHECK (registration_status IN ('unregistered', 'pending', 'verified', 'rejected'));

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_registration_status 
ON public.profiles(registration_status);

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.registration_status IS 
'Provider registration status: unregistered (default), pending (under review), verified (approved), rejected (denied)';
