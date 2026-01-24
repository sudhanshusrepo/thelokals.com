-- Add missing foreign key for bookings.user_id -> auth.users.id
-- Fixes PGRST200 errors on dashboard

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'bookings_user_id_fkey'
    ) THEN
        ALTER TABLE bookings
        ADD CONSTRAINT bookings_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES auth.users (id);
    END IF;
END $$;
