-- Fix RLS Policies for providers table
-- This allows users to register as providers and view other providers

ALTER TABLE providers ENABLE ROW LEVEL SECURITY;

-- 1. Allow everyone to view providers
DROP POLICY IF EXISTS "Providers are viewable by everyone" ON providers;
CREATE POLICY "Providers are viewable by everyone" 
ON providers FOR SELECT 
USING ( true );

-- 2. Allow authenticated users to create their own provider profile
-- Note: 'id' is the column that references auth.users
DROP POLICY IF EXISTS "Users can register as providers" ON providers;
CREATE POLICY "Users can register as providers" 
ON providers FOR INSERT 
WITH CHECK ( auth.uid() = id );

-- 3. Allow providers to update their own profile
DROP POLICY IF EXISTS "Providers can update own profile" ON providers;
CREATE POLICY "Providers can update own profile" 
ON providers FOR UPDATE 
USING ( auth.uid() = id );

-- 4. Allow providers to delete their own profile (optional but good practice)
DROP POLICY IF EXISTS "Providers can delete own profile" ON providers;
CREATE POLICY "Providers can delete own profile" 
ON providers FOR DELETE 
USING ( auth.uid() = id );
