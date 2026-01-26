-- Add push_token to providers table
ALTER TABLE providers 
ADD COLUMN IF NOT EXISTS push_token TEXT;

-- Index for faster lookups if needed (optional but good practice)
CREATE INDEX IF NOT EXISTS idx_providers_push_token ON providers(push_token);

-- Update RLS if necessary (providers usually can update their own rows, checking policies not visible here but standard usually allows update of own columns)
-- Existing RLS usually allows "UPDATE using (auth.uid() = id)" which covers all columns unless restricted.
