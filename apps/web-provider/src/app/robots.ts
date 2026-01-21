import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/dashboard/', '/profile/', '/api/'], // Disallow private routes
        },
        sitemap: 'https://provider.thelokals.com/sitemap.xml',
    }
}
