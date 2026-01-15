
// Configuration
const SUPABASE_PROJECT_REF = 'gdnltvvxiychrsdzenia'; // Hardcoded for Sprint 1 stability
const SUPABASE_STORAGE_URL = `https://${SUPABASE_PROJECT_REF}.supabase.co/storage/v1/object/public/service-assets`;

export function getServiceImageUrl(serviceName: string): string {
    if (!serviceName) return `${SUPABASE_STORAGE_URL}/thumbnails/service-def.png`;

    // Services that have PNG assets
    const PNG_SERVICES = new Set([
        'appliance-repair',
        'bike-rental', 'bike-repair', 'bike-wash',
        'car-rental', 'car-washing'
    ]);

    // Slugify: lowercase, remove special chars, replace spaces with hyphens
    const slug = serviceName
        .toLowerCase()
        .replace(/[&]/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    const ext = PNG_SERVICES.has(slug) ? '.png' : '.svg';
    return `${SUPABASE_STORAGE_URL}/thumbnails/${slug}${ext}`;
}

export function getServiceHeaderUrl(serviceName: string): string {
    if (!serviceName) return `${SUPABASE_STORAGE_URL}/headers/service-def.png`;

    const slug = serviceName
        .toLowerCase()
        .replace(/[&]/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    return `${SUPABASE_STORAGE_URL}/headers/${slug}.png`;
}
