
export function getServiceImageUrl(serviceName: string): string {
    if (!serviceName) return '/images/placeholders/service-def.svg';

    // Slugify: lowercase, remove special chars, replace spaces with hyphens
    const slug = serviceName
        .toLowerCase()
        .replace(/[&]/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    // Check for special cases if needed, otherwise default to svg
    // map common variations
    const map: Record<string, string> = {
        'plumber': 'plumber',
        'electrician': 'electrician',
        'maid': 'maid', // MaidService -> maid-service, but maybe just maid?
        'house-cleaning': 'house-cleaning',
    };

    // If exact match in map, use it
    if (map[slug]) return `/images/services/${map[slug]}.svg`;

    // Default logic
    return `/images/services/${slug}.svg`;
}
