-- Enable RLS and add public read policy to service_categories
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Service Categories"
ON service_categories FOR SELECT
USING (true);
