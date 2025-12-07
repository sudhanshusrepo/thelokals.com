-- Migration: Roadmap Phase 1 - Shared Core
-- Description: Aligning schema with new Strategic Roadmap (Shared Core)

-- 1. Update service_categories
-- Add 'type' column to distinguish between LOCAL and ONLINE services
ALTER TABLE service_categories 
ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('LOCAL', 'ONLINE')) DEFAULT 'LOCAL';

-- Update known online categories (based on previous seed data)
UPDATE service_categories SET type = 'ONLINE' 
WHERE name IN ('DigitalMarketing', 'ContentCreative', 'TechDev', 'BusinessOps', 'KnowledgeServices', 'ProfessionalAdvisory', 'WellnessOnline', 'CreatorEconomy', 'LocalBizDigitization');

-- 2. Update bookings table
-- Add delivery_mode and service_category_id
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS delivery_mode TEXT CHECK (delivery_mode IN ('LOCAL', 'ONLINE'));

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS service_category_id UUID REFERENCES service_categories(id);

-- Attempt to backfill service_category_id based on name matching
UPDATE bookings b
SET service_category_id = sc.id
FROM service_categories sc
WHERE b.service_category = sc.name
  AND b.service_category_id IS NULL;

-- Backfill delivery_mode based on service category type
UPDATE bookings b
SET delivery_mode = sc.type
FROM service_categories sc
WHERE b.service_category_id = sc.id
  AND b.delivery_mode IS NULL;

-- 3. Create Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')) DEFAULT 'PENDING',
  payment_method TEXT,
  transaction_id TEXT,
  commission_amount DECIMAL(10,2) DEFAULT 0,
  provider_payout_id UUID, -- Will reference provider_payouts
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- 4. Create Provider Payouts Table
CREATE TABLE IF NOT EXISTS provider_payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID REFERENCES providers(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT CHECK (status IN ('PENDING', 'PROCESSING', 'PAID', 'FAILED')) DEFAULT 'PENDING',
  commission_deducted DECIMAL(10,2) DEFAULT 0,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  transaction_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payouts_provider ON provider_payouts(provider_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON provider_payouts(status);

-- Link payments to provider_payouts
ALTER TABLE payments 
ADD CONSTRAINT fk_payments_payout 
FOREIGN KEY (provider_payout_id) REFERENCES provider_payouts(id);

-- 5. Update Admin Roles
-- Ensure role is TEXT to avoid ENUM issues and standardize behavior
ALTER TABLE admin_users DROP CONSTRAINT IF EXISTS admin_users_role_check;

-- Convert to TEXT if it's not already (handles ENUMs like admin_role)
ALTER TABLE admin_users ALTER COLUMN role TYPE TEXT USING role::text;

ALTER TABLE admin_users 
ADD CONSTRAINT admin_users_role_check 
CHECK (role IN ('super_admin', 'ops_admin', 'support_admin', 'finance_admin', 'read_only'));

-- 6. Enable RLS for new tables
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_payouts ENABLE ROW LEVEL SECURITY;

-- Ensure providers table has user_id (Backwards compatibility fix)
ALTER TABLE providers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
-- Update user_id from profiles if possible or manual backfill needed
-- For now, we ensure the column exists so policies don't fail.

-- Payments Policies
-- Users can see their own payments
CREATE POLICY users_view_own_payments ON payments
    FOR SELECT USING (
        auth.uid() IN (SELECT client_id FROM bookings WHERE id = booking_id)
    );

-- Providers can see payments for their bookings
CREATE POLICY providers_view_booking_payments ON payments
    FOR SELECT USING (
        auth.uid() IN (SELECT user_id FROM providers WHERE id = (SELECT provider_id FROM bookings WHERE id = booking_id))
    );

-- Payouts Policies
-- Providers can see their own payouts
CREATE POLICY providers_view_own_payouts ON provider_payouts
    FOR SELECT USING (
        auth.uid() IN (SELECT user_id FROM providers WHERE id = provider_id)
    );
