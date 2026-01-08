import { MetadataRoute } from 'next';
import { adminService } from '@thelocals/platform-core/services/adminService';

// Base URL for the client app
const BASE_URL = 'https://thelokals.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // 1. Static Routes
    const routes = ['', '/about', '/contact', '/book'].map((route) => ({
        url: `${BASE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 1.0,
    }));

    // 2. Dynamic Service Routes (SEO Critical)
    // Disabled during build to preventing failures if DB access is missing
    /*
    let serviceRoutes: MetadataRoute.Sitemap = [];
    try {
        const categories = await adminService.getServiceCategories();

        serviceRoutes = categories.map((cat) => ({
            url: `${BASE_URL}/services/${cat.id}`,
            lastModified: new Date((cat as any).updated_at || Date.now()),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }));
    } catch (error) {
        console.error('Failed to generate sitemap service routes:', error);
    }
    */

    return [...routes];
}
