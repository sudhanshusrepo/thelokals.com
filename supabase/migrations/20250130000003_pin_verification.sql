-- Add PIN verification and provider location tracking to bookings

-- Add verification PIN column
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS verification_pin TEXT;

-- Add provider location tracking
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS provider_location JSONB;

-- Function to generate random 4-digit PIN
CREATE OR REPLACE FUNCTION generate_booking_pin()
RETURNS TEXT AS $$
BEGIN
    RETURN LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate PIN when booking is confirmed
CREATE OR REPLACE FUNCTION set_booking_pin()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'CONFIRMED' AND OLD.status != 'CONFIRMED' AND NEW.verification_pin IS NULL THEN
        NEW.verification_pin := generate_booking_pin();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS booking_pin_trigger ON public.bookings;
CREATE TRIGGER booking_pin_trigger
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION set_booking_pin();

-- Index for faster PIN lookups
CREATE INDEX IF NOT EXISTS idx_bookings_verification_pin ON public.bookings(verification_pin);
