-- Sprint 1: Providers Table Repair
-- Goal: Align 'providers' table with the expected schema for Live Booking

BEGIN;

-- 1. Add missing columns
ALTER TABLE providers 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES service_categories(id),
ADD COLUMN IF NOT EXISTS location GEOGRAPHY(POINT, 4326),
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS price_per_hour DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS review_count INT DEFAULT 0;

-- 2. Backfill Location from lat/lng
UPDATE providers
SET location = ST_SetSRID(ST_MakePoint(current_lng, current_lat), 4326)::geography
WHERE location IS NULL AND current_lat IS NOT NULL AND current_lng IS NOT NULL;

-- 3. Backfill Category ID
-- This is a best-effort match based on name.
UPDATE providers p
SET category_id = sc.id
FROM service_categories sc
WHERE p.category_id IS NULL AND p.category = sc.name;

-- 4. Backfill User ID (Heuristic: If provider ID exists in profiles, use it)
-- Note: Often providers.id == auth.uid() in supabase setups.
-- We check if providers.id exists in auth.users.
UPDATE providers
SET user_id = id
WHERE user_id IS NULL AND EXISTS (SELECT 1 FROM auth.users WHERE id = providers.id);

COMMIT;
