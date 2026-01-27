
-- migrations/001_geo_data.sql
-- Geo Data Foundation: States, Cities, Pincodes

-- Ensure UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- States Table
CREATE TABLE IF NOT EXISTS states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cities Table
CREATE TABLE IF NOT EXISTS cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state_id UUID REFERENCES states(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pincodes Table (Updated Schema with cluster)
CREATE TABLE IF NOT EXISTS pincodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
    pincode CHAR(6) UNIQUE NOT NULL,
    cluster VARCHAR(50), 
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional: Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cities_state_id ON cities(state_id);
CREATE INDEX IF NOT EXISTS idx_pincodes_city_id ON pincodes(city_id);
CREATE INDEX IF NOT EXISTS idx_pincodes_pincode ON pincodes(pincode);
