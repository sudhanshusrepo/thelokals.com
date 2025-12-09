-- Add service_radius column to providers table if it doesn't exist
ALTER TABLE providers ADD COLUMN IF NOT EXISTS service_radius INTEGER DEFAULT 5000;

-- Notify that it was added (optional, for manual run confirmation)
DO $$
BEGIN
    RAISE NOTICE 'Added service_radius column to providers table';
END $$;
