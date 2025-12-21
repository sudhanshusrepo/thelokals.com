-- Add Provider Tiers and Earnings Tracking
-- Date: 2025-12-20

-- 1. Create Tier Enum
DO $$ BEGIN
    CREATE TYPE provider_tier AS ENUM ('tier1', 'tier2', 'tier3');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Update Providers Table
ALTER TABLE public.providers
ADD COLUMN IF NOT EXISTS tier provider_tier DEFAULT 'tier3',
ADD COLUMN IF NOT EXISTS tier_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS earnings_this_month DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS earnings_this_week DECIMAL(10, 2) DEFAULT 0;

-- 3. Index for performance
CREATE INDEX IF NOT EXISTS idx_providers_tier ON public.providers(tier);
