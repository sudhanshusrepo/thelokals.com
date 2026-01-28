-- migrations/009_live_booking_schema.sql
-- Schema for Live Booking Request System

-- 1. Booking Requests Table (Ephemerally tracks requests sent to providers)
CREATE TABLE IF NOT EXISTS booking_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    status VARCHAR(20) CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    UNIQUE(booking_id, provider_id)
);

-- Enable RLS
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;

-- Policies
-- Providers can see requests sent to them
CREATE POLICY "Providers can view own requests" ON booking_requests
    FOR SELECT USING (auth.uid() = provider_id);

-- Clients can view requests for their bookings
CREATE POLICY "Clients can view requests for their bookings" ON booking_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bookings b 
            WHERE b.id = booking_requests.booking_id 
            AND b.client_id = auth.uid()
        )
    );

-- 2. Enable Realtime
-- This is critical for the client to know when a provider accepts
ALTER PUBLICATION supabase_realtime ADD TABLE booking_requests;

-- 3. Live Booking RPC: Find Nearby Providers
-- Finds active providers of the matching category within X km
CREATE OR REPLACE FUNCTION find_nearby_providers(
    p_service_category_id UUID,
    p_lat DOUBLE PRECISION,
    p_lng DOUBLE PRECISION,
    p_radius_km DOUBLE PRECISION DEFAULT 10.0
)
RETURNS TABLE (
    provider_id UUID,
    distance_km DOUBLE PRECISION
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as provider_id,
        (
            6371 * acos(
                cos(radians(p_lat)) * cos(radians((p.location->>'lat')::float)) *
                cos(radians((p.location->>'lng')::float) - radians(p_lng)) +
                sin(radians(p_lat)) * sin(radians((p.location->>'lat')::float))
            )
        ) as distance_km
    FROM providers p
    JOIN provider_services ps ON p.id = ps.provider_id
    WHERE 
        ps.service_category_id = p_service_category_id
        AND p.is_active = true
        AND p.id != auth.uid() -- Don't find self if testing
        AND (
            6371 * acos(
                cos(radians(p_lat)) * cos(radians((p.location->>'lat')::float)) *
                cos(radians((p.location->>'lng')::float) - radians(p_lng)) +
                sin(radians(p_lat)) * sin(radians((p.location->>'lat')::float))
            )
        ) <= p_radius_km
    ORDER BY distance_km ASC
    LIMIT 10;
END;
$$;

-- 4. RPC: Create Booking Requests (Batch)
CREATE OR REPLACE FUNCTION create_booking_requests(
    p_booking_id UUID,
    p_provider_ids UUID[],
    p_expires_seconds INT DEFAULT 45
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_pid UUID;
BEGIN
    FOREACH v_pid IN ARRAY p_provider_ids
    LOOP
        INSERT INTO booking_requests (booking_id, provider_id, status, expires_at)
        VALUES (
            p_booking_id, 
            v_pid, 
            'PENDING', 
            NOW() + (p_expires_seconds || ' seconds')::INTERVAL
        )
        ON CONFLICT DO NOTHING;
    END LOOP;
END;
$$;

-- 5. RPC: Accept Booking (Atomic)
CREATE OR REPLACE FUNCTION accept_booking(
    p_request_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_booking_id UUID;
    v_provider_id UUID;
    v_current_status VARCHAR;
BEGIN
    -- 1. Get Request Details
    SELECT booking_id, provider_id, status 
    INTO v_booking_id, v_provider_id, v_current_status
    FROM booking_requests
    WHERE id = p_request_id;

    IF v_booking_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Request not found');
    END IF;

    -- 2. Check if already processed
    IF v_current_status != 'PENDING' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Request no longer valid');
    END IF;

    -- 3. Check if booking is still open
    -- We assume 'REQUESTED' is the open state
    IF NOT EXISTS (SELECT 1 FROM bookings WHERE id = v_booking_id AND status = 'REQUESTED') THEN
        RETURN jsonb_build_object('success', false, 'message', 'Booking already taken or cancelled');
    END IF;

    -- 4. ATOMIC UPDATE
    -- Assign Provider to Booking
    UPDATE bookings 
    SET 
        provider_id = v_provider_id,
        status = 'CONFIRMED', -- or EN_ROUTE
        updated_at = NOW()
    WHERE id = v_booking_id;

    -- Update Request Status
    UPDATE booking_requests
    SET status = 'ACCEPTED'
    WHERE id = p_request_id;

    -- Expire all OTHER requests for this booking
    UPDATE booking_requests
    SET status = 'EXPIRED'
    WHERE booking_id = v_booking_id AND id != p_request_id;

    RETURN jsonb_build_object('success', true, 'booking_id', v_booking_id);
END;
$$;
