-- Add Firebase authentication support to profiles table
-- Migration: 20251207_firebase_auth_integration.sql

-- Add Firebase UID column to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS firebase_uid TEXT UNIQUE;

-- Add phone number column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone_number TEXT UNIQUE;

-- Add phone verification status
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;

-- Add auth provider column to track which auth method was used
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'supabase' CHECK (auth_provider IN ('supabase', 'firebase', 'both'));

-- Index for Firebase UID lookups
CREATE INDEX IF NOT EXISTS idx_profiles_firebase_uid 
ON profiles(firebase_uid) WHERE firebase_uid IS NOT NULL;

-- Index for phone number lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone_number 
ON profiles(phone_number) WHERE phone_number IS NOT NULL;

-- Index for auth provider
CREATE INDEX IF NOT EXISTS idx_profiles_auth_provider 
ON profiles(auth_provider);

-- Comment on columns
COMMENT ON COLUMN profiles.firebase_uid IS 'Firebase Authentication UID for users who sign in with Firebase';
COMMENT ON COLUMN profiles.phone_number IS 'User phone number in E.164 format (e.g., +919876543210)';
COMMENT ON COLUMN profiles.phone_verified IS 'Whether the phone number has been verified via OTP';
COMMENT ON COLUMN profiles.auth_provider IS 'Authentication provider used: supabase (email), firebase (phone), or both';
