import { MetadataRoute } from 'next';

// In a real app, strict types for your services
type Service = {
    id: string;
    updatedAt: string;
};

const baseUrl = 'https://thelokals.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Mock data fetching for dynamic routes
    const services: Service[] = [
        { id: 'ac-repair', updatedAt: new Date().toISOString() },
        { id: 'cleaning', updatedAt: new Date().toISOString() },
    ];

    const serviceUrls = services.map((service) => ({
        url: `${baseUrl}/services/${service.id}`,
        lastModified: service.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date().toISOString(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/book/package`,
            lastModified: new Date().toISOString(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        ...serviceUrls,
    ];
}
