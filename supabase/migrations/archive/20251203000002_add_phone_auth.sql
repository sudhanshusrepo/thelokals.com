-- Add phone authentication support to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS firebase_uid TEXT;

-- Create index for phone lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_firebase_uid ON profiles(firebase_uid);

-- Update RLS policies to support phone-based authentication
-- Allow users to read their own profile by phone
CREATE POLICY "Users can read own profile by phone"
ON profiles FOR SELECT
USING (
  auth.uid() = user_id 
  OR phone = (SELECT phone FROM profiles WHERE user_id = auth.uid())
);

-- Allow authenticated users to update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = user_id);
