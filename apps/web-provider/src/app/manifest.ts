import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'The Locals Provider',
        short_name: 'Locals Pro',
        description: 'Manage your local service business',
        start_url: '/',
        display: 'standalone',
        background_color: '#F0F0F0',
        theme_color: '#8AE98D',
        icons: [
            {
                src: '/icon',
                sizes: '32x32',
                type: 'image/png',
            },
            {
                src: '/apple-icon',
                sizes: '180x180',
                type: 'image/png',
            },
        ],
    };
}
