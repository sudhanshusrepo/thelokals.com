
const { createClient } = require('@supabase/supabase-js');
const { faker } = require('@faker-js/faker');

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gdnltvvxiychrsdzenia.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_KEY) {
    console.error("Error: NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Indiranagar, Bangalore Center
const CENTER_LAT = 12.9716;
const CENTER_LNG = 77.6412;

function getRandomLocation(lat, lng, radiusInKm = 2) {
    const r = radiusInKm / 111.32; // Rough conversion
    const u = Math.random();
    const v = Math.random();
    const w = r * Math.sqrt(u);
    const t = 2 * Math.PI * v;
    const x = w * Math.cos(t);
    const y = w * Math.sin(t);
    // Adjust for longitude shrinking
    const xAdjusted = x / Math.cos(lat);
    return { lat: lat + y, lng: lng + xAdjusted };
}

const CATEGORIES = [
    'Cleaning', 'AC Service', 'Electrician', 'Plumber', 'Carpenter'
];

async function seedProviders() {
    console.log("Seeding 50 providers near Indiranagar...");
    const providers = [];

    for (let i = 0; i < 50; i++) {
        const loc = getRandomLocation(CENTER_LAT, CENTER_LNG);
        const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];

        providers.push({
            name: faker.person.fullName(),
            category: category,
            description: `Expert ${category} with ${Math.floor(Math.random() * 10) + 2} years of experience.`,
            price_per_hour: Math.floor(Math.random() * 500) + 200, // hourly/visit
            price_unit: 'visit',
            rating: parseFloat((Math.random() * (5.0 - 3.5) + 3.5).toFixed(1)),
            status: 'available', // old status col
            image_url: `https://gdnltvvxiychrsdzenia.supabase.co/storage/v1/object/public/service-assets/headers/${category.toLowerCase().replace(' ', '-')}.png`,
            expertise: [category, 'Repair', 'Installation'],
            review_count: Math.floor(Math.random() * 100),
            is_verified: true,
            // New Columns
            is_online: true,
            current_lat: loc.lat,
            current_lng: loc.lng,
            last_heartbeat: new Date().toISOString()
        });
    }

    const { data, error } = await supabase
        .from('workers')
        .insert(providers)
        .select();

    if (error) {
        console.error("Error seeding providers:", error);
    } else {
        console.log(`Successfully seeded ${data.length} providers.`);
    }
}

seedProviders();
