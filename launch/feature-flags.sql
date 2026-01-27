
-- launch/feature-flags.sql

CREATE TABLE IF NOT EXISTS app_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Insert default flag (Disabled initially)
INSERT INTO app_config (key, value)
VALUES ('geo_availability_enabled', 'false')
ON CONFLICT (key) DO NOTHING;

-- Function to check flag
CREATE OR REPLACE FUNCTION is_geo_enabled() RETURNS BOOLEAN AS $$
    SELECT value::boolean FROM app_config WHERE key = 'geo_availability_enabled';
$$ LANGUAGE sql;
