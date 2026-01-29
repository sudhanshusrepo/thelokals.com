
-- migrations/007_user_addresses.sql
-- User Addresses: Storing specific locations for users (Home, Work, etc.)

-- 1. Create user_addresses Table
CREATE TABLE IF NOT EXISTS user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    pincode VARCHAR(10),
    address TEXT,
    label VARCHAR(50) DEFAULT 'Home',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, label)
);

-- 2. Add saved_addresses column to users table (as requested, possibly for basic caching)
-- We use a DO block to safely add the column only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='saved_addresses') THEN
        ALTER TABLE users ADD COLUMN saved_addresses JSONB DEFAULT '[]';
    END IF;
END $$;

-- 3. RPC: Upsert User Address
-- logic: Insert a new address or update the existing one if the label matches (e.g. updating 'Home')
CREATE OR REPLACE FUNCTION upsert_user_address(
  p_user_id UUID,
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_pincode VARCHAR,
  p_address TEXT,
  p_label VARCHAR DEFAULT 'Home'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_address_id UUID;
BEGIN
  INSERT INTO user_addresses (user_id, lat, lng, pincode, address, label)
  VALUES (p_user_id, p_lat, p_lng, p_pincode, p_address, p_label)
  ON CONFLICT (user_id, label) 
  DO UPDATE SET
    lat = EXCLUDED.lat,
    lng = EXCLUDED.lng,
    pincode = EXCLUDED.pincode,
    address = EXCLUDED.address,
    updated_at = NOW()
  RETURNING id INTO v_address_id;
  
  RETURN v_address_id;
END;
$$;
