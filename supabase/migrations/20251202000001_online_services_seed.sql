-- Migration: Seed Online Services
-- Description: Inserts online service categories and default base prices.

-- 1. Insert Service Categories
INSERT INTO public.service_categories (name, group_name, icon, description, is_active) VALUES
('DigitalMarketing', 'Digital & Growth', '📈', 'Social media, SEO, marketing automation, and growth strategies.', true),
('ContentCreative', 'Content & Creative', '🎨', 'Writing, design, video editing, and creative production.', true),
('TechDev', 'Tech & Product', '💻', 'Development, UI/UX, QA, AI automation, and data analysis.', true),
('BusinessOps', 'Business & Operations', '💼', 'Virtual assistants, project management, finance, and HR.', true),
('KnowledgeServices', 'Knowledge & Advisory', '🧠', 'Tutoring, coaching, legal, financial, and business advice.', true),
('ProfessionalAdvisory', 'Knowledge & Advisory', '⚖️', 'Legal, financial, and business advice.', true),
('WellnessOnline', 'Wellness & Personal', '🧘', 'Mental health, life coaching, nutrition, and fitness plans.', true),
('CreatorEconomy', 'Creator Economy', '📱', 'UGC, personal branding, and influencer services.', true),
('LocalBizDigitization', 'Local Biz Digitization', '🏪', 'Get your local business online with Google, catalogs, and more.', true)
ON CONFLICT (name) DO UPDATE SET 
    group_name = EXCLUDED.group_name,
    icon = EXCLUDED.icon,
    description = EXCLUDED.description;

-- 2. Insert Base Prices for Online Services
INSERT INTO public.base_prices (service_category, service_type, base_price, currency) VALUES
-- DigitalMarketing
('DigitalMarketing', 'SEO Optimization', 5000.00, 'INR'),
('DigitalMarketing', 'Social Media Mgmt', 8000.00, 'INR'),
('DigitalMarketing', 'Ad Campaigns', 5000.00, 'INR'),

-- ContentCreative
('ContentCreative', 'Blog Writing', 1000.00, 'INR'),
('ContentCreative', 'Graphic Design', 500.00, 'INR'),
('ContentCreative', 'Video Editing', 1000.00, 'INR'),

-- TechDev
('TechDev', 'Website Development', 10000.00, 'INR'),
('TechDev', 'App Development', 50000.00, 'INR'),
('TechDev', 'Automation', 5000.00, 'INR'),

-- BusinessOps
('BusinessOps', 'Virtual Assistant', 500.00, 'INR'),
('BusinessOps', 'Data Entry', 300.00, 'INR'),

-- KnowledgeServices
('KnowledgeServices', 'Online Tutoring', 500.00, 'INR'),
('KnowledgeServices', 'Career Coaching', 1000.00, 'INR'),

-- ProfessionalAdvisory
('ProfessionalAdvisory', 'Legal Consultation', 2000.00, 'INR'),
('ProfessionalAdvisory', 'Financial Advice', 1500.00, 'INR'),

-- WellnessOnline
('WellnessOnline', 'Online Therapy', 1000.00, 'INR'),
('WellnessOnline', 'Diet/Nutrition Plan', 1500.00, 'INR'),

-- CreatorEconomy
('CreatorEconomy', 'UGC Creation', 2000.00, 'INR'),
('CreatorEconomy', 'Influencer Collab', 5000.00, 'INR'),

-- LocalBizDigitization
('LocalBizDigitization', 'Google My Business', 2000.00, 'INR'),
('LocalBizDigitization', 'Digital Catalog', 1000.00, 'INR')

ON CONFLICT (service_category, service_type, effective_from) DO NOTHING;
