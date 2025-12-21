-- Seed service categories for client landing page
-- This migration adds initial service categories with display order, images, and gradients

INSERT INTO public.service_categories (id, name, description, icon_url, image_url, gradient_colors, display_order, is_active, created_at, updated_at)
VALUES
    ('ac-appliances', 'AC & Appliances', 'AC repair • RO service • Fridge repair', '❄️', 'https://images.unsplash.com/photo-1621905476059-5f3460b56b3b?q=80&w=600', 'from-blue-500/80 to-cyan-500/80', 1, true, now(), now()),
    ('rides', 'Rides (Bike & Cab)', 'Bike taxi • Car rental • Airport transfer', '🏍️', 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=600', 'from-orange-500/80 to-red-500/80', 2, true, now(), now()),
    ('cleaning', 'Home Cleaning', 'Deep cleaning • Regular cleaning • Sofa cleaning', '🧹', 'https://images.unsplash.com/photo-1581578731117-10452b7a7028?q=80&w=600', 'from-green-500/80 to-emerald-500/80', 3, true, now(), now()),
    ('electrician', 'Electrician', 'Wiring • Switch repair • Fan installation', '⚡', 'https://images.unsplash.com/photo-1621905476059-5f3460b56b3b?q=80&w=600', 'from-yellow-500/80 to-amber-500/80', 4, true, now(), now()),
    ('plumbing', 'Plumbing', 'Leak repair • Pipe fitting • Bathroom fixtures', '🔧', 'https://images.unsplash.com/photo-1505798577917-a651a5d40318?q=80&w=600', 'from-blue-600/80 to-indigo-600/80', 5, true, now(), now()),
    ('salon', 'Salon & Grooming', 'Haircut • Facial • Massage', '💇', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600', 'from-pink-500/80 to-rose-500/80', 6, true, now(), now()),
    ('car-wash', 'Car Wash', 'Exterior • Interior • Full detailing', '🚿', 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=600', 'from-teal-500/80 to-cyan-500/80', 7, true, now(), now()),
    ('bike-wash', 'Bike Wash', 'Quick wash • Deep clean • Polish', '💦', 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=600', 'from-purple-500/80 to-pink-500/80', 8, true, now(), now()),
    ('yoga', 'Yoga & Fitness', 'Yoga session • Personal training • Meditation', '🧘', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600', 'from-slate-500/80 to-gray-500/80', 9, true, now(), now())
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon_url = EXCLUDED.icon_url,
    image_url = EXCLUDED.image_url,
    gradient_colors = EXCLUDED.gradient_colors,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = now();
