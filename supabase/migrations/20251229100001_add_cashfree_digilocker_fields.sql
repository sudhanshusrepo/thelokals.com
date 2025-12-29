-- Add Cashfree PG and DigiLocker integration fields
-- Migration: 20251229100001_add_cashfree_digilocker_fields.sql
-- Purpose: Enable Cashfree merchant onboarding and DigiLocker KYC verification

BEGIN;

-- Add Cashfree fields to providers table
ALTER TABLE providers ADD COLUMN IF NOT EXISTS cashfree_merchant_id TEXT;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS cashfree_onboarding_status TEXT CHECK (cashfree_onboarding_status IN ('pending', 'in_progress', 'completed', 'failed'));
ALTER TABLE providers ADD COLUMN IF NOT EXISTS cashfree_account_verified BOOLEAN DEFAULT false;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS cashfree_onboarded_at TIMESTAMPTZ;

-- Add DigiLocker fields to providers table
ALTER TABLE providers ADD COLUMN IF NOT EXISTS digilocker_verified BOOLEAN DEFAULT false;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS digilocker_verification_data JSONB;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS digilocker_verified_at TIMESTAMPTZ;

-- Add Cashfree payment tracking to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cashfree_order_id TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cashfree_payment_id TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cashfree_payment_link TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cashfree_webhook_data JSONB;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cashfree_payment_method TEXT;

-- Create index for faster Cashfree order lookups
CREATE INDEX IF NOT EXISTS idx_bookings_cashfree_order_id ON bookings(cashfree_order_id);
CREATE INDEX IF NOT EXISTS idx_providers_cashfree_merchant_id ON providers(cashfree_merchant_id);

COMMIT;
