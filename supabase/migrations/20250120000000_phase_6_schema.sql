-- ============================================
-- THELOKALS.COM - PHASE 6 SCHEMA (ADMIN & PROVIDER PARITY)
-- ============================================
-- Version: 1.0
-- Date: 2025-01-20
-- Description: Adds provider verification status, document metadata, booking ratings, reviews, and issue types.
-- ============================================

-- 1. Create Verification Status Enum
DO $$ BEGIN
    CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Update Providers Table
ALTER TABLE public.providers 
ADD COLUMN IF NOT EXISTS verification_status verification_status DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '{}', -- Stores {"aadhaar": "url", "pan": "url"}
ADD COLUMN IF NOT EXISTS verification_notes TEXT,
ADD COLUMN IF NOT EXISTS rating_avg DECIMAL(3,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS rating_count INT DEFAULT 0;

-- Index for Admin Dashboard filtering
CREATE INDEX IF NOT EXISTS idx_providers_verification ON public.providers(verification_status);

-- 3. Update Bookings Table
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS customer_rating INT, -- 1-5
ADD COLUMN IF NOT EXISTS customer_review TEXT,
ADD COLUMN IF NOT EXISTS customer_rating_timestamp TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS issue_type TEXT, -- "Standard", "Urgent", "Inspection"
ADD COLUMN IF NOT EXISTS issue_description TEXT; -- "Leaking pipe near kitchen sink"

-- Index for ratings
CREATE INDEX IF NOT EXISTS idx_bookings_rating ON public.bookings(customer_rating);
CREATE INDEX IF NOT EXISTS idx_bookings_issue ON public.bookings(issue_type);

-- 4. RLS Policy Updates (Safety)
-- Allow providers to see their own ratings details (via bookings)
CREATE POLICY "providers_read_own_ratings" ON public.bookings
FOR SELECT
USING (provider_id = auth.uid());

-- Allow admins full access to update verification status (Already covered by Service Role, but if we add admin auth later)
-- For now, Service Role handles Admin App actions.

-- 5. Trigger to Update Provider Average Rating
CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.customer_rating IS NOT NULL THEN
        UPDATE public.providers
        SET 
            rating_count = rating_count + 1,
            rating_avg = (
                SELECT COALESCE(AVG(customer_rating), 0)
                FROM public.bookings
                WHERE provider_id = NEW.provider_id AND customer_rating IS NOT NULL
            )
        WHERE id = NEW.provider_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_update_provider_rating ON public.bookings;
CREATE TRIGGER tr_update_provider_rating
AFTER UPDATE OF customer_rating ON public.bookings
FOR EACH ROW
WHEN (OLD.customer_rating IS DISTINCT FROM NEW.customer_rating)
EXECUTE PROCEDURE update_provider_rating();

-- 6. Grant Permissions
GRANT ALL ON public.providers TO service_role;
GRANT ALL ON public.bookings TO service_role;
