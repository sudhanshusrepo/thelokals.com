-- migrations/010_update_bookings_schema.sql
-- Add missing columns to bookings table for Live Booking and AI Booking support

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS booking_type VARCHAR(50) DEFAULT 'LIVE', -- 'LIVE', 'AI_ENHANCED', 'SCHEDULED'
ADD COLUMN IF NOT EXISTS service_category_id UUID, -- References service_categories(id) logically
ADD COLUMN IF NOT EXISTS service_item_id UUID,     -- References service_items(id) logically
ADD COLUMN IF NOT EXISTS requirements JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS delivery_mode VARCHAR(20) DEFAULT 'LOCAL',
ADD COLUMN IF NOT EXISTS provider_earnings NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS platform_commission NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS meeting_link TEXT,
ADD COLUMN IF NOT EXISTS meeting_provider VARCHAR(50);

-- Create index for faster filtering by type
CREATE INDEX IF NOT EXISTS idx_bookings_type ON bookings(booking_type);
