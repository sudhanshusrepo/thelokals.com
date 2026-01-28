-- migrations/008_seed_services.sql
-- Seed the services table with base codes required for availability logic

INSERT INTO services (code, name, is_globally_enabled)
VALUES 
    ('PLUMBING', 'Plumbing', true),
    ('CLEANING', 'Home Cleaning', true),
    ('ELECTRICIAN', 'Electrician', true),
    ('PAINTING', 'Painting', true),
    ('DRIVER', 'Driving', true),
    ('COOK', 'Cooking', true)
ON CONFLICT (code) DO NOTHING;
