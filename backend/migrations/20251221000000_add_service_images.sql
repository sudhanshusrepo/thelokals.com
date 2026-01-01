-- Add image_url, icon_url, gradient_colors, and display_order to service_categories if they don't exist
ALTER TABLE service_categories ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE service_categories ADD COLUMN IF NOT EXISTS icon_url TEXT;
ALTER TABLE service_categories ADD COLUMN IF NOT EXISTS gradient_colors TEXT[];
ALTER TABLE service_categories ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
