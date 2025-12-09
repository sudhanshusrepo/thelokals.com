-- Add Local Service Categories to match Test Fixtures and Service Pricing
-- These are required for the Booking Flow Test (Local Services)

INSERT INTO service_categories (name, group_name, icon, description, is_active) VALUES
('cleaning', 'Home Services', '🧹', 'Professional home cleaning services', true),
('plumbing', 'Home Services', '🔧', 'Expert plumbing repairs and installation', true),
('electrician', 'Home Services', '⚡', 'Electrical repairs, wiring, and installation', true),
('carpenter', 'Home Services', '🪚', 'Custom furniture and wood repairs', true),
('painting', 'Home Services', '🎨', 'Interior and wall painting services', true),
('appliance_repair', 'Home Services', '🔌', 'Repair for washing machines, fridges, etc.', true),
('pest_control', 'Home Services', '🐜', 'Safe and effective pest control', true),
('home_cleaning', 'Home Services', '🧼', 'Deep cleaning for your home', true)
ON CONFLICT (name) DO UPDATE SET
    group_name = EXCLUDED.group_name,
    icon = EXCLUDED.icon,
    description = EXCLUDED.description;
