import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/book/payment', '/profile'], // Private routes
        },
        sitemap: 'https://thelokals.com/sitemap.xml',
    };
}
